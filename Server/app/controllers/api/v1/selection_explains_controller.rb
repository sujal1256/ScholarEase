# frozen_string_literal: true

class Api::V1::SelectionExplainsController < ApplicationController
  CONTEXT_CHARS = 300  # chars to take from adjacent sections

  def create
    selected_text = params[:selected_text].to_s.strip
    document_id   = params[:document_id].to_i
    section_id    = params[:section_id].to_i

    return render json: { error: 'selected_text is required' }, status: :bad_request if selected_text.blank?
    return render json: { error: 'selected_text too long (max 2000 chars)' }, status: :bad_request if selected_text.length > 2000
    return render json: { error: 'document_id is required' }, status: :bad_request if document_id.zero?

    document = Document.find_by(id: document_id)
    return render json: { error: 'Document not found' }, status: :not_found unless document

    context = build_context(document, section_id)
    content_hash = SelectionExplanation.content_hash_for(selected_text, context)

    # Return cached result immediately if available
    cached = SelectionExplanation.completed.find_by(content_hash: content_hash)
    return render json: serialise(cached), status: :ok if cached

    record = SelectionExplanation.find_or_create_by!(content_hash: content_hash) do |r|
      r.document      = document
      r.selected_text = selected_text
      r.context       = context
      r.status        = 'pending'
    end

    ExplainSelectionJob.perform_async(record.id, section_id) if record.status == 'pending'

    render json: serialise(record), status: :accepted
  end

  def show
    record = SelectionExplanation.find_by(id: params[:id])
    return render json: { error: 'Not found' }, status: :not_found unless record

    render json: serialise(record)
  end

  private

  def build_context(document, section_id)
    sections = document.sections.order(:page_number).to_a
    current  = sections.find { |s| s.id == section_id } || sections.first
    return '' unless current

    idx = sections.index(current)
    prev_content = sections[idx - 1]&.content&.last(CONTEXT_CHARS) if idx > 0
    next_content = sections[idx + 1]&.content&.first(CONTEXT_CHARS)

    [prev_content, current.content, next_content]
      .compact
      .join("\n\n---\n\n")
      .truncate(3000, omission: '...')
  end

  def serialise(record)
    base = {
      id:            record.id,
      status:        record.status,
      selected_text: record.selected_text,
    }

    case record.status
    when 'completed'
      base.merge(explanation: record.explanation, context_used: record.context.truncate(300))
    when 'failed'
      base.merge(error: record.error_message)
    else
      base
    end
  end
end
