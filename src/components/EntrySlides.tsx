import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import LocationIllustration from "@/components/ui/svg/location.svg"
import WhispaAI from "@/components/ui/svg/whispa.svg"
import SecurityIllustration from "@/components/ui/svg/security.svg"
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useNotification'
import { toast } from 'sonner'
import { useLocation } from '@/hooks/useLocation'
import { Loader2, MapPin} from 'lucide-react'


const slides = [
  {
    image: LocationIllustration,
    title: "Shop Local, Stay Connected",
    subtitle: "Discover sellers and products around you in real time",
    tip: "We use your location to show relevant, nearby listings",
    bgGradient: "from-orange-900/20 to-gray-900"
  },
  {
    image: SecurityIllustration,
    title: "Trade With Confidence",
    subtitle: "Verified sellers and secure transactions, always",
    tip: "Your trust and safety are our top priorities",
    bgGradient: "from-orange-700/20 to-gray-900"
  },
  {
    image: WhispaAI, 
    title: "Meet Whispa, Your Smart Guide",
    subtitle: "Get instant help finding sellers, products, and deals",
    tip: "Ask Whispa anything to get started quickly",
    bgGradient: "from-purple-800/20 to-gray-900"
  }
];

// Memoize the slide content to prevent unnecessary re-renders
const SlideContent = memo(({ slide, isTransitioning }: { slide: typeof slides[0], isTransitioning: boolean }) => (
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
      loading="eager"
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
      className="text-sm text-gray-400 text-center italic px-8 mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {slide.tip}
    </motion.p>
  </motion.div>
))

export function EntrySlides() {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const swiperRef = useRef<any>(null)
  // const locationState = rrd_useLocation().state
  const {requestPermission, initializeNotifications,isInitialized, permissionStatus} = useNotifications()
  const {detectLocation: requestLocationPermissions, isLocationServicesAllowed, isDetecting} = useLocation()

  // if (!locationState) redirect("/");

  // Memoize handlers to prevent unnecessary re-renders
  const handleSlideChange = useCallback((swiper: any) => {
    setIsTransitioning(true)
    setActiveIndex(swiper.activeIndex)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [])

  const handleContinue = useCallback(async () => {
    await new Promise((resolve) => {
      requestLocationPermissions();
      const checkLocation = setInterval(() => {
        if (isLocationServicesAllowed) {
          clearInterval(checkLocation);
          resolve(true);
        }
      }, 100);
    });
    if (!isLocationServicesAllowed) {
      setShowLocationModal(true)
      return
    }

    setTimeout(requestNotificationPermissions, 1500)
    navigate("/role-selection", { replace: true })
  }, [isLocationServicesAllowed, requestLocationPermissions])

  const handleGrantPermission = useCallback(async () => {
    await requestLocationPermissions()
    
    if (!isLocationServicesAllowed) {
      toast.error("Location permission is required to continue. Please enable it in your browser settings.")
      return
    }

    setShowLocationModal(false)
    setTimeout(requestNotificationPermissions, 1500)
    navigate("/role-selection", { replace: true })
  }, [isLocationServicesAllowed, requestLocationPermissions])

  useEffect(() => {
    initializeNotifications()
  }, [initializeNotifications])

  const requestNotificationPermissions = async () => {
      const permissionGranted = await requestPermission()

      if (!permissionGranted) {
        toast.info("PERMISSION DENIED: No worries! You can enable notifications later in settings. Let's continue setting up your account.")
      }
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

      <div className="relative z-10 w-full h-full flex flex-col container max-w-screen-sm">
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
              <SlideContent slide={slide} isTransitioning={isTransitioning} />
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
                disabled={isDetecting}
                className="bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105"
                onClick={handleContinue}
              >
                {isDetecting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Get Started"
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-orange-400/30 blur-sm" />
      <div className="absolute bottom-1/4 right-16 w-6 h-6 rounded-full bg-orange-400/20 blur-sm" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-orange-400/15 blur-sm" />
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-50 border border-orange-500/20 rounded-xl shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Location Permission Required
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-300 space-y-4">
              <p className="text-base leading-relaxed">
                Location services are mandatory for MeetnMart to function properly. We need your location to:
              </p>
              <ul className="space-y-3 pl-4">
                <li className="flex items-center gap-2 text-gray-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Connect you with nearby buyers and sellers
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Show relevant local markets and products nearby
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Enable accurate delivery tracking
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700/50">
            <Button
              variant="outline"
              onClick={() => setShowLocationModal(false)}
              className="border-gray-600 hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all hover:scale-105"
              onClick={handleGrantPermission}
            >
              Grant Permission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}