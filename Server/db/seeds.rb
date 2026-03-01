# db/seeds.rb

# 1. Create a User
user = User.find_or_create_by!(email: 'test@scholarease.com') do |u|
  u.first_name = 'Test'
  u.last_name = 'User'
end

# 2. Create a Document
doc = Document.find_or_create_by!(title: 'The Transformer Paper') do |d|
  d.user = user
  d.status = :completed
  d.page_count = 5
end

# 3. Create Sections (Dummy Text from the actual Transformer paper)
sections_data = [
  {
    title: 'Abstract',
    content: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
    page: 1
  },
  {
    title: 'Introduction',
    content: 'Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling.',
    page: 1
  }
]

sections_data.each_with_index do |data, index|
  Section.find_or_create_by!(document: doc, position: index) do |s|
    s.content = data[:content]
    s.section_type = data[:title]
    s.page_number = data[:page]
  end
end

puts "✅ Seeded: 1 User, 1 Document, #{Section.count} Sections."
