import { loadStripe } from '@stripe/stripe-js'

// Replace with your actual Stripe publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key_here'

if (stripePublishableKey === 'pk_test_your_stripe_key_here') {
  console.warn('⚠️  Please update your Stripe publishable key in .env file')
}

let stripePromise

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}

// Stripe helpers for payment processing
export const stripeHelpers = {
  // Format amount for display
  formatAmount(cents, currency = 'EUR') {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  },

  // Create Stripe Checkout Session for advertisement packages
  async createCheckoutSession(packageData, userProfile) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceData: {
            currency: 'eur',
            product_data: {
              name: packageData.name,
              description: packageData.description,
            },
            unit_amount: packageData.price_euros,
          },
          quantity: 1,
          customer_email: userProfile.email,
          metadata: {
            package_id: packageData.id,
            user_id: userProfile.id,
            duration_months: packageData.duration_months,
          },
          success_url: `${window.location.origin}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/sponsor/packages`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      return sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId) {
    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({ sessionId })
    
    if (error) {
      throw error
    }
  },

  // Mock function for demo purposes (replace with actual Stripe webhook handling)
  async handlePaymentSuccess(sessionId, packageId, userId) {
    // In a real app, this would be handled by a webhook
    // For demo, we'll simulate successful payment
    return {
      success: true,
      paymentIntent: {
        id: `pi_mock_${Date.now()}`,
        amount: 2000,
        currency: 'eur',
        status: 'succeeded'
      }
    }
  }
}

export default getStripe