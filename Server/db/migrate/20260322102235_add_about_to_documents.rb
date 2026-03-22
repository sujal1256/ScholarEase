class AddAboutToDocuments < ActiveRecord::Migration[7.1]
  def change
    add_column :documents, :about, :text
  end
end
