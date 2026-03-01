class CreateSections < ActiveRecord::Migration[7.1]
  def change
    create_table :sections do |t|
      t.references :document, null: false, foreign_key: true
      t.text :content                # The actual text (e.g., "Abstract: This study...")
      t.string :section_type         # 'header', 'paragraph', 'list', 'table'
      t.integer :page_number         # To scroll the user to the right page
      t.integer :position            # To keep them in order (1, 2, 3...)

      t.timestamps
    end
  end
end
