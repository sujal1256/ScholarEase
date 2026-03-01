Sidekiq.configure_server do |config|
  # We use the REDIS_URL from your environment, or local default
  config.redis = { url: ENV['REDIS_URL'] }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] }
end
