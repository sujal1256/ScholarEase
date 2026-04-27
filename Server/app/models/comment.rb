class Comment < ApplicationRecord
  belongs_to :document
  belongs_to :section, optional: true
  belongs_to :user,    optional: true
  belongs_to :parent,  class_name: 'Comment', optional: true
  has_many   :replies, class_name: 'Comment', foreign_key: :parent_id, dependent: :destroy

  TYPES = %w[user ai].freeze

  validates :content,      presence: true, length: { maximum: 5000 }
  validates :comment_type, inclusion: { in: TYPES }
  validate  :valid_offsets

  scope :root,       -> { where(parent_id: nil) }
  scope :for_page,   ->(section_id) { where(section_id: section_id) }
  scope :with_tree,  -> { includes(:replies, :user) }

  private

  def valid_offsets
    return unless start_offset.present? && end_offset.present?
    errors.add(:end_offset, 'must be greater than start_offset') if end_offset <= start_offset
  end
end
