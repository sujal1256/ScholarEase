# frozen_string_literal: true

class Api::V1::AiResponsesController < ApplicationController
  def show
    @ai_response = AiResponse.find(params[:id])
    render json: @ai_response
  end
end
