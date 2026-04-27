class AddAudioPathToAiResponses < ActiveRecord::Migration[7.1]
  def change
    add_column :ai_responses, :audio_path, :string
  end
end
