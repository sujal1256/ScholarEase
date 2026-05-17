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

    # Save the uploaded file temporarily
    file_path = save_upload_file(params[:file])

    # Upload to Cloudinary
    begin
      cloudinary_response = Cloudinary::Uploader.upload(file_path, resource_type: 'auto')
      cloud_url = cloudinary_response['secure_url']
    rescue StandardError => e
      Rails.logger.error("Cloudinary upload failed: #{e.message}")
      render json: { error: "Failed to upload to cloud storage. Ensure CLOUDINARY_URL is set." }, status: :unprocessable_entity
      return
    end

    # Create document record with pending status and cloud url
    @document = Document.create!(
      user: user,
      title: params[:title] || params[:file].original_filename,
      file_url: cloud_url,
      status: :pending
    )

    # Parse PDF using Python script with the local temp file
    sections_data = parse_pdf(file_path)

    # Clean up local file after processing
    File.delete(file_path) if File.exist?(file_path)

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

    documents = user.documents.not_in_active.order(created_at: :desc).offset(offset).limit(per_page)

    docs = documents.map do |doc|
      {
        id: doc.id,
        title: doc.title,
        page_count: doc.page_count,
        about: doc.about,
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
      pdf_url: @document.file_url,
      sections: sections
    }
  end

  # GET /api/v1/documents/:id/pdf
  def pdf
    @document = Document.find(params[:id])

    if @document.file_url.blank?
      render json: { error: 'PDF file not found' }, status: :not_found
      return
    end

    if @document.file_url.start_with?('http')
      redirect_to @document.file_url, allow_other_host: true
      return
    end

    file_path = Rails.root.join(@document.file_url)

    unless File.exist?(file_path)
      render json: { error: 'PDF file not found on server' }, status: :not_found
      return
    end

    send_file(file_path, type: 'application/pdf', disposition: 'inline')
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
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
    python_bin = 'python3'
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
