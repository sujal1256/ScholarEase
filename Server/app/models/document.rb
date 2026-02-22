# == Schema Information
#
# Table name: documents
#
#  id         :bigint           not null, primary key
#  user_id    :bigint           not null
#  title      :string
#  file_url   :string
#  status     :integer
#  page_count :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Document < ApplicationRecord
  belongs_to :user
  enum status: { pending: 0, processing: 1, completed: 2, failed: 3 }
end
