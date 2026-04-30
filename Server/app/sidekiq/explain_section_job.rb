require 'open3'
require 'timeout'
require 'json'

class ExplainSectionJob
  include Sidekiq::Job

  sidekiq_options retry: 3, dead: true

  PYTHON_TIMEOUT = 180 # seconds (TTS adds processing time)

  def perform(section_id)
    section = Section.find(section_id)
    stdout, stderr, status = run_explainer(section)
    log_stderr(stderr) if stderr.present?

    unless status.success? && stdout.strip.present?
      safe_stderr = stderr.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
      raise ExplainerError, "Explainer failed (exit #{status.exitstatus}): #{safe_stderr.strip.truncate(500)}"
    end

    data = JSON.parse(stdout.strip)
    text = data["text"].presence or raise ExplainerError, "Explainer returned empty text"

    save_ai_response(section, text, data["audio_path"])
  end

  private

  def run_explainer(section)
    python_bin  = Rails.root.join('.venv', 'bin', 'python3').to_s
    script_path = Rails.root.join('lib', 'ai', 'explainer.py').to_s

    Timeout.timeout(PYTHON_TIMEOUT) do
      Open3.capture3(python_bin, script_path, section.content)
    end
  rescue Timeout::Error
    raise ExplainerError, "Python explainer timed out after #{PYTHON_TIMEOUT}s"
  end

  def log_stderr(stderr)
    stderr = stderr.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
    stderr.each_line do |line|
      line = line.strip
      next if line.empty?
      parsed = JSON.parse(line)
      level  = parsed["event"]&.include?("error") || parsed.key?("error") ? :error : :info
      Rails.logger.public_send(level, "[ExplainSectionJob] #{parsed.to_json}")
    rescue JSON::ParserError
      Rails.logger.warn("[ExplainSectionJob] #{line}")
    end
  end

  def save_ai_response(section, text, audio_path)
    AiResponse.reset_column_information
    AiResponse.create!(
      section:    section,
      intent:     'simplify',
      output:     text,
      audio_path: audio_path
    )
    update_document_about(section.document)
  end

  def update_document_about(document)
    return if document.about.present?
    about = document.derive_about
    document.update_columns(about: about) if about
  end

  class ExplainerError < StandardError; end
end
