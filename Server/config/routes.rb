Rails.application.routes.draw do
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq_web_portal'

  namespace :api do
    namespace :v1 do
      resources :documents, only: [:index, :create, :show]

      resources :sections, only: [:index, :show] do
        # This creates /api/v1/sections/:id/explain and /api/v1/sections/:id/ai_response
        member do
          post 'explain'
          get 'ai_response'
        end
      end

      resources :annotations
      resources :ai_responses, only: [:show]
    end
  end
end
