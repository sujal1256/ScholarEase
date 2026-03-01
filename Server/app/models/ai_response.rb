# == Schema Information
#
# Table name: ai_responses
#
#  id              :bigint           not null, primary key
#  section_id      :bigint           not null
#  intent          :string
#  output          :text
#  target_language :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class AiResponse < ApplicationRecord
  belongs_to :section

  # Validations ensure we don't save empty AI garbage
  validates :intent, presence: true
  validates :output, presence: true

  # Ensure we only have ONE explanation per section/intent
  validates :section_id, uniqueness: { scope: %i[intent target_language] }
end
