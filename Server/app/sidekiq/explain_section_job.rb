require 'open3'

class ExplainSectionJob
  include Sidekiq::Job

  def perform(section_id)
    section = Section.find(section_id)
    stdout, stderr, status = run_explainer(section)
    if status.success?
      save_ai_response(section, stdout.strip)
    else
      Rails.logger.error("LangExtract Error: #{stderr}")
    end
  end

  private

  def run_explainer(section)
    python_bin = Rails.root.join('.venv', 'bin', 'python3').to_s
    script_path = Rails.root.join('lib', 'ai', 'explainer.py').to_s
    Open3.capture3(python_bin, script_path, section.content)
  end

  def save_ai_response(section, output)
    AiResponse.create!(section: section, intent: 'simplify', output: output)
    update_document_about(section.document)
  end

  def update_document_about(document)
    return if document.about.present?
    about = document.derive_about
    document.update_columns(about: about) if about
  end
end
