class RenameCacheKeyOnSelectionExplanations < ActiveRecord::Migration[7.1]
  def change
    rename_column :selection_explanations, :cache_key, :content_hash
  end
end
