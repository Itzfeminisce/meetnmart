import { useState, useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

import LocationIllustration from "@/components/ui/svg/location.svg"
import NotificationIllustration from "@/components/ui/svg/notification.svg"
import SecurityIllustration from "@/components/ui/svg/security.svg"
import { redirect, useLocation, useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotification'
import { toast } from 'sonner'

export function EntrySlides() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const swiperRef = useRef<any>(null)
  const locationState = useLocation().state
  const {requestPermission, initializeNotifications,isInitialized} = useNotifications()

  if (!locationState) redirect("/");

  const slides = [
    {
      image: LocationIllustration,
      title: "Precise Location, Better Matches",
      subtitle: "We use your location to connect you with nearby buyers/sellers",
      tip: "Access only when app is active",
      bgGradient: "from-orange-900/20 to-gray-900"
    },
    {
      image: NotificationIllustration,
      title: "Real-Time Updates",
      subtitle: "Instant alerts for orders, messages, and deliveries",
      tip: "No spam - only essential updates",
      bgGradient: "from-orange-800/20 to-gray-900"
    },
    {
      image: SecurityIllustration,
      title: "You're in Control",
      subtitle: "Adjust permissions anytime in settings",
      tip: "We never share your data",
      bgGradient: "from-orange-700/20 to-gray-900"
    }
  ]

  useEffect(() => {
    initializeNotifications()
  }, [])
  const requestPermissions = async () => {
    try {
      const permissionGranted = await requestPermission()

      if (!permissionGranted) {
        toast.info("PERMISSION DENIED: No worries! You can enable notifications later in settings. Let's continue setting up your account.")
      }

      // Navigate to role selection after handling permissions
      navigate("/role-selection", { replace: true, state: locationState })
    } catch (error) {
      console.error('Permission error:', error)
      toast.error("Something went wrong. Let's try again later.")
      navigate("/role-selection", { replace: true })
    }
  }

  const handleSlideChange = (swiper: any) => {
    setIsTransitioning(true)
    setActiveIndex(swiper.activeIndex)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  return (
    <div className=" bg-gray-900 text-gray-50 flex flex-col items-center py-4 relative overflow-hidden h-screen">
      {/* Animated background gradients */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-b ${slides[activeIndex].bgGradient} z-0`}
        />
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex flex-col container">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
          pagination={false}
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          speed={800}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="flex flex-col items-center h-full pt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isTransitioning ? 0.7 : 1,
                  y: isTransitioning ? 10 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={slide.image}
                  alt={slide.title}
                  className="w-64 h-[10rem] mb-8 object-contain"
                  whileHover={{ scale: 1.05 }}
                />
                <motion.h2
                  className="text-2xl font-bold text-center mb-4 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  className="text-gray-300 text-center mb-6 px-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
                <motion.p
                  className="text-sm text-gray-400 text-center italic px-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {slide.tip}
                </motion.p>
              </motion.div>
            </SwiperSlide>
          ))}

          {/* Custom Progress Indicator */}
          <div className="absolute bottom-0 inset-0 px-8 mb-4">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-400"
                animate={{
                  width: `${(activeIndex + 1) * (100 / slides.length)}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </Swiper>

        {/* Navigation Controls */}
        <div className="mt-auto pt-4 mb-8 flex justify-between w-full px-4">
          <Button
            variant="ghost"
            className={`text-orange-400 hover:bg-gray-700 transition-all ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            onClick={() => swiperRef.current?.swiper.slidePrev()}
          >
            Back
          </Button>

          {activeIndex < slides.length - 1 ? (
            <Button
              size='sm'
              className="bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105"
              onClick={() => swiperRef.current?.swiper.slideNext()}
            >
              Continue
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                className="bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105"
                onClick={requestPermissions}
              >
                Agree and Continue
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-orange-400/30 blur-sm" />
      <div className="absolute bottom-1/4 right-16 w-6 h-6 rounded-full bg-orange-400/20 blur-sm" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-orange-400/15 blur-sm" />
    </div>
  )
}