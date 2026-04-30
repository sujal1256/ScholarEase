namespace :audio do
  desc 'Backfill audio for AiResponses where audio_path is NULL'
  task backfill: :environment do
    missing = AiResponse.where(audio_path: nil).where.not(output: [nil, ''])
    puts "Found #{missing.count} AiResponse(s) missing audio."

    python_bin  = Rails.root.join('.venv', 'bin', 'python3').to_s
    script      = Rails.root.join('lib', 'ai', 'generate_audio.py').to_s

    missing.each do |response|
      print "  section_id=#{response.section_id} ... "

      begin
        stdout, stderr, status = Open3.capture3(
          python_bin, script,
          stdin_data: response.output
        )

        if status.success? && stdout.strip.present?
          data = JSON.parse(stdout.strip)
          if data['audio_path']
            response.update_columns(audio_path: data['audio_path'])
            puts "OK (#{data['audio_path']})"
          else
            puts "SKIP — TTS returned no path: #{data['error']}"
          end
        else
          puts "FAIL — #{stderr.strip.truncate(120)}"
        end
      rescue => e
        puts "ERROR — #{e.message}"
      end
    end

    puts 'Done.'
  end
end
