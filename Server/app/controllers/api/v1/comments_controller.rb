# frozen_string_literal: true

class Api::V1::CommentsController < ApplicationController
  def index
    document = Document.find(params[:document_id])
    comments = document.comments
                       .root
                       .with_tree
                       .order(created_at: :asc)
    render json: comments.map { |c| serialise(c, replies: true) }
  end

  def create
    comment = Comment.new(comment_params)

    if comment.save
      render json: serialise(comment), status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def replies
    parent = Comment.find(params[:id])
    reply  = parent.replies.new(
      comment_params.merge(document_id: parent.document_id)
    )

    if reply.save
      render json: serialise(reply), status: :created
    else
      render json: { errors: reply.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.permit(
      :document_id, :section_id, :content,
      :selected_text, :start_offset, :end_offset, :comment_type
    )
  end

  def serialise(comment, replies: false)
    h = {
      id:            comment.id,
      content:       comment.content,
      selected_text: comment.selected_text,
      start_offset:  comment.start_offset,
      end_offset:    comment.end_offset,
      comment_type:  comment.comment_type,
      section_id:    comment.section_id,
      parent_id:     comment.parent_id,
      created_at:    comment.created_at.iso8601,
    }
    h[:replies] = comment.replies.map { |r| serialise(r) } if replies
    h
  end
end
