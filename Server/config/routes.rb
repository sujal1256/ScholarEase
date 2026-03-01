Rails.application.routes.draw do
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq_web_portal'

  namespace :api do
    namespace :v1 do
      resources :sections, only: [:index, :show] do
        # This creates /api/v1/sections/:id/explain
        post 'explain', on: :member
      end

      resources :annotations
      resources :ai_responses, only: [:show]
    end
  end
end
