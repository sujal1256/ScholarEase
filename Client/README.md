# ScholarEase — AI Research Intelligence

Landing page built with **React + Vite + Tailwind CSS + Framer Motion**.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
scholarease/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Root component
    ├── index.css         # Global styles + Tailwind
    └── components/
        ├── Navbar.jsx        # Sticky nav with mobile menu
        ├── Hero.jsx          # Hero with floating doc cards
        ├── Features.jsx      # 6-card features grid
        ├── HowItWorks.jsx    # 4-step process
        ├── Collections.jsx   # Library shelf visual
        ├── Testimonials.jsx  # 3 testimonial cards
        ├── Pricing.jsx       # 3-tier pricing
        ├── CTABanner.jsx     # Call-to-action section
        └── Footer.jsx        # Footer with links
```

## 📦 Libraries Used

| Library | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `framer-motion` | Scroll animations, fade-ups, transitions |
| `react-icons` | All icons (Remix Icon set) |
| `react-scroll` | Smooth scroll nav links |
| `tailwindcss` | Utility-first styling |
| `vite` | Build tool |

## 🎨 Design

- **Fonts**: Cormorant Garamond (display) + Syne (UI) + DM Mono (labels)
- **Palette**: Deep charcoal `#09090d` + Warm amber `#d4913a`
- **Style**: Dark editorial — academic journal meets modern SaaS

## 🔌 Backend Integration

All CTAs and form interactions are currently placeholder `href="#"`.  
When your backend is ready, replace those with your API calls / routes.
