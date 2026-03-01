class CreateAnnotations < ActiveRecord::Migration[7.1]
  def change
    create_table :annotations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :section, null: false, foreign_key: true
      t.text :comment                # The user's typed note
      t.string :selected_text        # The snippet they highlighted in the PDF
      t.string :color                # Highlight color (yellow, blue, etc.)
      t.timestamps
    end
  end
end
