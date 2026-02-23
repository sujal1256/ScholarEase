import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Collections from './components/Collections'
import Testimonials from './components/Testimonials'
import Pricing from './components/Pricing'
import CTABanner from './components/CTABanner'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-bg font-syne">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Collections />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  )
}
