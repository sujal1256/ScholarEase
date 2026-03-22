# frozen_string_literal: true

class Api::V1::SectionsController < ApplicationController
  def explain
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
      render json: { status: 'completed', output: existing_response.output }
    else
      ExplainSectionJob.perform_async(@section.id)

      render json: { status: 'processing', message: 'AI is thinking...' }, status: :accepted
    end
  end

  def ai_response
    @section = Section.find(params[:id])
    existing_response = AiResponse.find_by(section: @section, intent: 'simplify')

    if existing_response
      render json: { status: 'completed', output: existing_response.output }
    else
      render json: { status: 'pending', message: 'No AI response yet' }
    end
  end
end
