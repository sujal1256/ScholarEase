class AddIndexToAiResponses < ActiveRecord::Migration[7.1]
  def change
    add_index :ai_responses, [:section_id, :intent]
  end
end
