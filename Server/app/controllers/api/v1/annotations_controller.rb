# frozen_string_literal: true

class Api::V1::AnnotationsController < ApplicationController
  def show
    @annotation = Annotation.find(params[:id])
    render json: @annotation
  end
end
