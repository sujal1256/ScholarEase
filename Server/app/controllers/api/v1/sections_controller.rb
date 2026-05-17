# frozen_string_literal: true

class Api::V1::SectionsController < ApplicationController
  def explain
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
      # If audio failed on the original run, retry it in the background
      AudioRetryJob.new.perform(existing_response.id) if existing_response.audio_path.blank?
      render json: ai_response_payload(existing_response)
    else
      ExplainSectionJob.new.perform(@section.id)
      render json: { status: 'processing', message: 'AI is thinking...' }, status: :accepted
    end
  end

  def ai_response
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
      AudioRetryJob.new.perform(existing_response.id) if existing_response.audio_path.blank?
      render json: ai_response_payload(existing_response)
    else
      render json: { status: 'pending', message: 'No AI response yet' }
    end
  end

  private

  def ai_response_payload(response)
    payload = { status: 'completed', output: response.output }
    payload[:audio_url] = "#{request.base_url}/#{response.audio_path}" if response.audio_path.present?
    payload
  end
end
