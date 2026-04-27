# frozen_string_literal: true

class Api::V1::SectionsController < ApplicationController
  def explain
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
      render json: ai_response_payload(existing_response)
    else
      ExplainSectionJob.perform_async(@section.id)
      render json: { status: 'processing', message: 'AI is thinking...' }, status: :accepted
    end
  end

  def ai_response
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
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
