# == Schema Information
#
# Table name: sections
#
#  id           :bigint           not null, primary key
#  document_id  :bigint           not null
#  content      :text
#  section_type :string
#  page_number  :integer
#  position     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class Section < ApplicationRecord
  belongs_to :document
  has_many :ai_responses, dependent: :destroy
  has_many :annotations, dependent: :destroy
  has_many :comments, dependent: :destroy

  validates :content, presence: true

  # Helper to check if this section is already explained
  def explained?
    ai_responses.exists?(intent: 'simplify')
  end
end
