# frozen_string_literal: true

require 'open3'
require 'fileutils'
require 'json'

class Api::V1::DocumentsController < ApplicationController
  # POST /api/v1/documents
  def create
    # Get or create a default user for now (in production, use authenticated user)
    user = User.first_or_create!(email: 'default@scholarease.com') do |u|
      u.first_name = 'Default'
      u.last_name = 'User'
    end

    # Validate file is present
    unless params[:file]
      render json: { error: 'File is required' }, status: :unprocessable_entity
      return
    end

    # Create document record with pending status
    @document = Document.create!(
      user: user,
      title: params[:title] || params[:file].original_filename,
      status: :pending
    )

    # Save the uploaded file temporarily
    temp_file_path = save_upload_file(params[:file])

    # Parse PDF using Python script
    sections_data = parse_pdf(temp_file_path)

    # Clean up temp file
    File.delete(temp_file_path) if File.exist?(temp_file_path)

    if sections_data.is_a?(Array) && !sections_data.empty?
      # Create Section records for each page
      sections_data.each do |section_data|
        Section.create!(
          document: @document,
          content: section_data['content'],
          page_number: section_data['page_number'],
          position: section_data['position'],
          section_type: "Page #{section_data['page_number']}"
        )
      end

      # Update document with page count and status
      @document.update(page_count: sections_data.length, status: :completed)

      # Return document with sections
      sections = @document.sections.map do |s|
        { id: s.id, page_number: s.page_number, content: s.content.first(200) }
      end

      render json: {
        id: @document.id,
        title: @document.title,
        page_count: @document.page_count,
        sections: sections
      }, status: :created
    else
      @document.update(status: :failed)
      render json: { error: 'Failed to parse PDF' }, status: :unprocessable_entity
    end
  rescue StandardError => e
    Rails.logger.error("Document creation error: #{e.message}")
    @document.update(status: :failed) if @document
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # GET /api/v1/documents
  def index
    user = User.first_or_create!(email: 'tester@example.com') do |u|
      u.first_name = 'Default'
      u.last_name = 'User'
    end

    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 10).to_i
    offset = (page - 1) * per_page

    total_count = user.documents.count
    total_pages = (total_count.to_f / per_page).ceil

    documents = user.documents.order(created_at: :desc).offset(offset).limit(per_page)

    docs = documents.map do |doc|
      {
        id: doc.id,
        title: doc.title,
        page_count: doc.page_count,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }
    end

    render json: {
      documents: docs,
      pagination: {
        current_page: page,
        per_page: per_page,
        total_pages: total_pages,
        total_documents: total_count
      }
    }
  end

  # GET /api/v1/documents/:id
  def show
    @document = Document.find(params[:id])

    sections = @document.sections.map do |s|
      ai_response = s.ai_responses.find_by(intent: 'simplify')
      {
        id: s.id,
        page_number: s.page_number,
        content: s.content,
        simplified: ai_response&.output
      }
    end

    render json: {
      id: @document.id,
      title: @document.title,
      page_count: @document.page_count,
      sections: sections
    }
  end

  private

  def save_upload_file(file)
    # Create storage directory if needed
    storage_dir = Rails.root.join('storage', 'uploads')
    FileUtils.mkdir_p(storage_dir)

    # Generate unique filename
    filename = "#{SecureRandom.hex(8)}_#{file.original_filename}"
    file_path = storage_dir.join(filename)

    # Write the uploaded file to disk
    File.open(file_path, 'wb') do |f|
      f.write(file.read)
    end

    file_path.to_s
  end

  def parse_pdf(file_path)
    python_bin = Rails.root.join('.venv', 'bin', 'python3').to_s
    script_path = Rails.root.join('lib', 'ai', 'pdf_parser.py').to_s

    stdout, stderr, status = Open3.capture3(python_bin, script_path, file_path)

    if status.success?
      JSON.parse(stdout)
    else
      Rails.logger.error("PDF Parser Error: #{stderr}")
      nil
    end
  rescue JSON::ParserError => e
    Rails.logger.error("JSON parse error: #{e.message}")
    nil
  end
end
