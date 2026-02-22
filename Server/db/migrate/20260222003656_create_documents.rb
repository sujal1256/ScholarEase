class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.string :file_url
      t.integer :status
      t.integer :page_count
      t.timestamps
    end
  end
end
