import { useState, useRef, useCallback, memo } from 'react'
import { MapPin, Shield, Sparkles, Loader2, Users, ShoppingBag, Zap, Star, Heart, ArrowRight } from 'lucide-react'
import {AnimatePresence, motion} from "framer-motion"
import { useLocation } from '@/hooks/useLocation';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    icon: MapPin,
    title: "Discover What's Around You",
    subtitle: "Find amazing deals and unique items right in your neighborhood",
    description: "Connect with sellers nearby and discover hidden gems in your local community",
    primaryColor: "from-emerald-400 to-teal-500",
    accentColor: "emerald-400",
    bgPattern: "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)",
    particles: [
      { x: 10, y: 20, size: 4, delay: 0 },
      { x: 85, y: 15, size: 6, delay: 0.5 },
      { x: 75, y: 70, size: 3, delay: 1 },
      { x: 15, y: 80, size: 5, delay: 1.5 }
    ]
  },
  {
    icon: Shield,
    title: "Shop with Complete Peace of Mind",
    subtitle: "Verified sellers, secure payments, and buyer protection",
    description: "Every transaction is protected. Trade confidently with our verified community",
    primaryColor: "from-blue-400 to-indigo-500",
    accentColor: "blue-400",
    bgPattern: "radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
    particles: [
      { x: 20, y: 25, size: 5, delay: 0.2 },
      { x: 80, y: 10, size: 4, delay: 0.7 },
      { x: 65, y: 75, size: 6, delay: 1.2 },
      { x: 25, y: 85, size: 3, delay: 1.7 }
    ]
  },
  {
    icon: Sparkles,
    title: "Meet Whispa, Your Smart Assistant",
    subtitle: "Get instant help finding exactly what you're looking for",
    description: "Ask anything, get personalized recommendations, and discover deals you'll love",
    primaryColor: "from-purple-400 to-pink-500",
    accentColor: "purple-400",
    bgPattern: "radial-gradient(circle at 40% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
    particles: [
      { x: 15, y: 30, size: 4, delay: 0.3 },
      { x: 85, y: 25, size: 5, delay: 0.8 },
      { x: 70, y: 65, size: 3, delay: 1.3 },
      { x: 30, y: 75, size: 6, delay: 1.8 }
    ]
  }
];

const FloatingElement = ({ x, y, size, delay, color }) => (
  <div
    className="absolute rounded-full blur-sm animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color === 'emerald-400' ? 'rgba(52, 211, 153, 0.2)' : 
                      color === 'blue-400' ? 'rgba(96, 165, 250, 0.2)' : 
                      'rgba(196, 181, 253, 0.2)',
      animationDelay: `${delay}s`
    }}
  />
)

const IconContainer = ({ icon: Icon, color, isActive }) => (
  <div
    className={`relative mx-auto mb-8 w-32 h-32 rounded-3xl p-1 shadow-2xl transition-transform duration-500 ${
      isActive ? 'scale-105' : 'scale-100'
    }`}
    style={{
      background: color === 'from-emerald-400 to-teal-500' 
        ? 'linear-gradient(135deg, #34d399, #14b8a6)'
        : color === 'from-blue-400 to-indigo-500'
        ? 'linear-gradient(135deg, #60a5fa, #6366f1)'
        : 'linear-gradient(135deg, #c4b5fd, #ec4899)'
    }}
  >
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
      <Icon className="w-16 h-16 text-white drop-shadow-lg" />
    </div>
  </div>
)

const StatsOverlay = () => (
  <div className="absolute top-4 right-4 flex flex-col gap-2">
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
      <Users className="w-3 h-3 text-emerald-400" />
      <span className="text-xs text-white/90">10K+ Users</span>
    </div>
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
      <ShoppingBag className="w-3 h-3 text-blue-400" />
      <span className="text-xs text-white/90">50K+ Items</span>
    </div>
  </div>
)

const SlideContent = memo(({ slide, isActive, index }) => (
  <div className="flex flex-col items-center h-full pt-8 px-6 relative">
    <div 
      className="absolute inset-0 opacity-30"
      style={{ background: slide.bgPattern }}
    />
    
    {slide.particles.map((particle, i) => (
      <FloatingElement
        key={i}
        x={particle.x}
        y={particle.y}
        size={particle.size}
        delay={particle.delay}
        color={slide.accentColor}
      />
    ))}

    {index === 0 && <StatsOverlay />}

    <IconContainer 
      icon={slide.icon} 
      color={slide.primaryColor}
      isActive={isActive}
    />

    <motion.div
      className="text-center space-y-4 relative z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 10 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-white leading-tight">
        {slide.title}
      </h2>
      
      <p className="text-xl text-gray-200 leading-relaxed">
        {slide.subtitle}
      </p>
      
      <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">
        {slide.description}
      </p>

      <motion.div
        className="flex justify-center gap-1 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 text-yellow-400 fill-current"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        <span className="text-xs text-gray-300 ml-2">4.8/5 rating</span>
      </motion.div>
    </motion.div>
  </div>
))

export function EntrySlides() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const {detectLocation, isLocationServicesAllowed} = useLocation()
  const navigate = useNavigate()
  const swiperRef = useRef(null)

  const handleSlideChange = useCallback((newIndex) => {
    setIsTransitioning(true)
    setActiveIndex(newIndex)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [])

  const nextSlide = () => {
    if (activeIndex < slides.length - 1) {
      handleSlideChange(activeIndex + 1)
    }
  }

  const prevSlide = () => {
    if (activeIndex > 0) {
      handleSlideChange(activeIndex - 1)
    }
  }

  const handleContinue = useCallback(async () => {
    if(isLocationServicesAllowed){
      navigate("/role-selection", {replace: true})
      return;
    }

    setIsDetecting(true)
    // Simulate location detection
    
    detectLocation()
    setIsDetecting(false)
    setShowLocationModal(true)
  }, [])

  const handleGrantPermission = useCallback(() => {
    setShowLocationModal(false)
   navigate("/role-selection", {replace: true})
      return;
  }, [])

  const currentSlide = slides[activeIndex]

  return (
    <div className="relative bg-gray-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Dynamic background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%), linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)`
          }}
        />
      </AnimatePresence>

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-full container max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              MeetnMart
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {activeIndex + 1} of {slides.length}
          </div>
        </motion.div>

        {/* Slides */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0 h-full">
                <SlideContent 
                  slide={slide} 
                  isActive={index === activeIndex}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress and Navigation */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full flex-1 ${
                  index === activeIndex ? 'bg-gradient-to-r ' + currentSlide.primaryColor : 'bg-gray-700'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === activeIndex ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              className={`text-gray-400 hover:text-white transition-all px-4 py-2 rounded-lg ${
                activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              onClick={prevSlide}
            >
              Back
            </button>

            {activeIndex < slides.length - 1 ? (
              <button
                className="px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform shadow-lg"
                style={{
                  background: currentSlide.primaryColor === 'from-emerald-400 to-teal-500' 
                    ? 'linear-gradient(135deg, #34d399, #14b8a6)'
                    : currentSlide.primaryColor === 'from-blue-400 to-indigo-500'
                    ? 'linear-gradient(135deg, #60a5fa, #6366f1)'
                    : 'linear-gradient(135deg, #c4b5fd, #ec4899)'
                }}
                onClick={nextSlide}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
            ) : (
              <button
                disabled={isDetecting}
                className="px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                style={{
                  background: currentSlide.primaryColor === 'from-emerald-400 to-teal-500' 
                    ? 'linear-gradient(135deg, #34d399, #14b8a6)'
                    : currentSlide.primaryColor === 'from-blue-400 to-indigo-500'
                    ? 'linear-gradient(135deg, #60a5fa, #6366f1)'
                    : 'linear-gradient(135deg, #c4b5fd, #ec4899)'
                }}
                onClick={handleContinue}
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Get Started
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Permission Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 text-white max-w-sm w-full rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Enable Location Access</h3>
              </div>
              <div className="text-gray-300 space-y-3">
                <p>We need your location to connect you with nearby sellers and show relevant local listings.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                    <span>Find sellers near you</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                    <span>Get accurate delivery estimates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                    <span>Discover local deals</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Not Now
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-colors"
                onClick={handleGrantPermission}
              >
                Allow Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
