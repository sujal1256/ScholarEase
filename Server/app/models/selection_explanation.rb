class SelectionExplanation < ApplicationRecord
  belongs_to :document

  STATUSES = %w[pending completed failed].freeze

  validates :selected_text, presence: true, length: { maximum: 2000 }
  validates :context,       presence: true
  validates :status,        inclusion: { in: STATUSES }
  validates :content_hash, presence: true, uniqueness: true

  scope :completed, -> { where(status: 'completed') }

  def self.content_hash_for(selected_text, context)
    Digest::SHA256.hexdigest("#{selected_text}|#{context}")[0, 20]
  end
end
