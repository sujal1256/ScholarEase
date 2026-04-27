require 'open3'
require 'timeout'
require 'json'

class ExplainSelectionJob
  include Sidekiq::Job

  sidekiq_options retry: 3, dead: true

  PYTHON_TIMEOUT = 60

  # section_id is optional — passed so we can anchor the AI comment to the page
  def perform(selection_explanation_id, section_id = nil)
    record = SelectionExplanation.find(selection_explanation_id)
    return if record.status == 'completed'

    stdout, stderr, status = run_explainer(record.selected_text, record.context)
    log_stderr(stderr) if stderr.present?

    unless status.success? && stdout.strip.present?
      record.update!(status: 'failed', error_message: stderr.strip.truncate(500))
      raise ExplainerError, "Selection explainer failed (exit #{status.exitstatus})"
    end

    data = JSON.parse(stdout.strip)

    if data["error"]
      record.update!(status: 'failed', error_message: data["error"].truncate(500))
      raise ExplainerError, "LLM returned error: #{data["error"]}"
    end

    record.update!(status: 'completed', explanation: data["explanation"])

    create_ai_comment(record, data["explanation"], section_id)
  end

  private

  def create_ai_comment(record, explanation, section_id)
    Comment.create!(
      document_id:   record.document_id,
      section_id:    section_id,
      content:       explanation,
      selected_text: record.selected_text,
      comment_type:  'ai'
    )
  rescue => e
    # AI comment creation is non-fatal — the explanation is already saved
    Rails.logger.error("[ExplainSelectionJob] Failed to create AI comment: #{e.message}")
  end

  def run_explainer(selected_text, context)
    python_bin  = Rails.root.join('.venv', 'bin', 'python3').to_s
    script_path = Rails.root.join('lib', 'ai', 'selection_explainer.py').to_s
    input       = JSON.generate({ selected_text: selected_text, context: context })

    Timeout.timeout(PYTHON_TIMEOUT) do
      Open3.capture3(python_bin, script_path, stdin_data: input)
    end
  rescue Timeout::Error
    raise ExplainerError, "Selection explainer timed out after #{PYTHON_TIMEOUT}s"
  end

  def log_stderr(stderr)
    stderr.each_line do |line|
      line = line.strip
      next if line.empty?
      parsed = JSON.parse(line)
      level  = parsed["event"]&.include?("error") || parsed.key?("error") ? :error : :info
      Rails.logger.public_send(level, "[ExplainSelectionJob] #{parsed.to_json}")
    rescue JSON::ParserError
      Rails.logger.warn("[ExplainSelectionJob] #{line}")
    end
  end

  # Also pass section_id when enqueueing from the controller
  def self.enqueue(selection_explanation_id, section_id = nil)
    perform_async(selection_explanation_id, section_id)
  end

  class ExplainerError < StandardError; end
end
