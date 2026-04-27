# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_04_27_181314) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "ai_responses", force: :cascade do |t|
    t.bigint "section_id", null: false
    t.string "intent"
    t.text "output"
    t.string "target_language"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "audio_path"
    t.index ["section_id", "intent"], name: "index_ai_responses_on_section_id_and_intent"
  end

  create_table "annotations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "section_id", null: false
    t.text "comment"
    t.string "selected_text"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["section_id"], name: "index_annotations_on_section_id"
    t.index ["user_id"], name: "index_annotations_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.bigint "section_id"
    t.bigint "user_id"
    t.bigint "parent_id"
    t.text "content", null: false
    t.text "selected_text"
    t.integer "start_offset"
    t.integer "end_offset"
    t.string "comment_type", default: "user", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_id", "created_at"], name: "index_comments_on_document_id_and_created_at"
    t.index ["document_id"], name: "index_comments_on_document_id"
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["section_id", "comment_type"], name: "index_comments_on_section_id_and_comment_type"
    t.index ["section_id"], name: "index_comments_on_section_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "documents", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.string "file_url"
    t.integer "status"
    t.integer "page_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "about"
    t.index ["user_id"], name: "index_documents_on_user_id"
  end

  create_table "sections", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.text "content"
    t.string "section_type"
    t.integer "page_number"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_id"], name: "index_sections_on_document_id"
  end

  create_table "selection_explanations", force: :cascade do |t|
    t.bigint "document_id", null: false
    t.text "selected_text", null: false
    t.text "context", null: false
    t.text "explanation"
    t.string "status", default: "pending", null: false
    t.string "content_hash", null: false
    t.string "error_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["content_hash"], name: "index_selection_explanations_on_content_hash", unique: true
    t.index ["document_id"], name: "index_selection_explanations_on_document_id"
    t.index ["status"], name: "index_selection_explanations_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "first_name"
    t.string "last_name"
    t.integer "role"
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "annotations", "sections"
  add_foreign_key "annotations", "users"
  add_foreign_key "comments", "comments", column: "parent_id"
  add_foreign_key "comments", "documents"
  add_foreign_key "comments", "sections"
  add_foreign_key "comments", "users"
  add_foreign_key "documents", "users"
  add_foreign_key "sections", "documents"
  add_foreign_key "selection_explanations", "documents"
end
