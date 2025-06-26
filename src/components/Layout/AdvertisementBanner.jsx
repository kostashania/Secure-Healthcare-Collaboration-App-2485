import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../contexts/DataContext'
import { dbHelpers } from '../../lib/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiExternalLink } = FiIcons

const AdvertisementBanner = () => {
  const { advertisements } = useData()
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const activeAds = advertisements.filter(ad => 
    ad.status === 'active' && 
    new Date(ad.end_date) > new Date()
  )

  useEffect(() => {
    if (activeAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % activeAds.length)
      }, 10000) // Change ad every 10 seconds

      return () => clearInterval(interval)
    }
  }, [activeAds.length])

  const handleAdClick = async (ad) => {
    try {
      // Track click
      await dbHelpers.updateAdvertisement(ad.id, {
        clicks: (ad.clicks || 0) + 1
      })

      // Open link if provided
      if (ad.link_url) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error tracking ad click:', error)
    }
  }

  const handleAdImpression = async (ad) => {
    try {
      // Track impression
      await dbHelpers.updateAdvertisement(ad.id, {
        impressions: (ad.impressions || 0) + 1
      })
    } catch (error) {
      console.error('Error tracking ad impression:', error)
    }
  }

  useEffect(() => {
    // Track impression when ad changes
    if (activeAds[currentAdIndex]) {
      handleAdImpression(activeAds[currentAdIndex])
    }
  }, [currentAdIndex, activeAds])

  if (!isVisible || activeAds.length === 0) {
    return null
  }

  const currentAd = activeAds[currentAdIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Advertisement Content */}
              <div 
                className="flex items-center space-x-4 flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={() => handleAdClick(currentAd)}
              >
                {currentAd.image_url && (
                  <img
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {currentAd.title}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {currentAd.content}
                  </p>
                </div>
                
                {currentAd.link_url && (
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Ad Indicators */}
              {activeAds.length > 1 && (
                <div className="flex space-x-1">
                  {activeAds.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentAdIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentAdIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sponsored Label */}
            <div className="flex items-center space-x-3 ml-4">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Sponsored
              </span>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar for Auto-advance */}
        {activeAds.length > 1 && (
          <motion.div
            className="h-1 bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 10, ease: 'linear' }}
            key={currentAdIndex}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default AdvertisementBanner