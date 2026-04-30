require 'open3'
require 'json'

class AudioRetryJob
  include Sidekiq::Job

  sidekiq_options retry: 2, dead: false

  def perform(ai_response_id)
    response = AiResponse.find_by(id: ai_response_id)
    return unless response
    return if response.audio_path.present? # already filled by another worker

    python_bin  = Rails.root.join('.venv', 'bin', 'python3').to_s
    script_path = Rails.root.join('lib', 'ai', 'generate_audio.py').to_s

    stdout, _stderr, status = Open3.capture3(
      python_bin, script_path,
      stdin_data: response.output.to_s
    )

    return unless status.success? && stdout.strip.present?

    data = JSON.parse(stdout.strip)
    return unless data['audio_path']

    response.update_columns(audio_path: data['audio_path'])
  end
end
