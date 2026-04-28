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
  has_many :sections, dependent: :destroy
  has_many :ai_responses, through: :sections
  has_many :comments, dependent: :destroy
  enum status: { pending: 0, processing: 1, completed: 2, failed: 3, in_active: 4}

  # Generate a short "about" summary from the first AI simplification
  def derive_about
    first_response = ai_responses.find_by(intent: 'simplify')
    return nil unless first_response

    # Take first 200 chars and end at a sentence boundary
    text = first_response.output.to_s.strip
    summary = text.length > 200 ? text[0..200].gsub(/\s\w+$/, '') + '...' : text
    summary
  end
end
