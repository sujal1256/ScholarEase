class CreateComments < ActiveRecord::Migration[7.1]
  def change
    create_table :comments do |t|
      t.references :document, null: false, foreign_key: true
      t.references :section,  null: true,  foreign_key: true
      t.references :user,     null: true,  foreign_key: true
      t.bigint     :parent_id                           # self-referential for replies
      t.text       :content,       null: false
      t.text       :selected_text
      t.integer    :start_offset
      t.integer    :end_offset
      t.string     :comment_type,  null: false, default: 'user'

      t.timestamps
    end

    add_index :comments, :parent_id
    add_index :comments, [:document_id, :created_at]
    add_index :comments, [:section_id, :comment_type]
    add_foreign_key :comments, :comments, column: :parent_id
  end
end
