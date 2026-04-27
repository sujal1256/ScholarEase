class CreateSelectionExplanations < ActiveRecord::Migration[7.1]
  def change
    create_table :selection_explanations do |t|
      t.references :document, null: false, foreign_key: true
      t.text     :selected_text, null: false
      t.text     :context,       null: false
      t.text     :explanation
      t.string   :status,        null: false, default: 'pending'
      t.string   :cache_key,     null: false
      t.string   :error_message

      t.timestamps
    end

    add_index :selection_explanations, :cache_key, unique: true
    add_index :selection_explanations, :status
  end
end
