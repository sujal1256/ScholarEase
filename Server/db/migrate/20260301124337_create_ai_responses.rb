class CreateAiResponses < ActiveRecord::Migration[7.1]
  def change
    create_table :ai_responses do |t|
      t.bigint 'section_id', null: false
      t.string 'intent' # 'simplify', 'summarize', 'translate'
      t.text 'output' # The AI's result
      t.string 'target_language' # Useful for the translation feature
      t.timestamps
    end
  end
end
