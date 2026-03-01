# == Schema Information
#
# Table name: annotations
#
#  id            :bigint           not null, primary key
#  user_id       :bigint           not null
#  section_id    :bigint           not null
#  comment       :text
#  selected_text :string
#  color         :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class Annotation < ApplicationRecord
  belongs_to :user
  belongs_to :section

  validates :comment, presence: true
end
