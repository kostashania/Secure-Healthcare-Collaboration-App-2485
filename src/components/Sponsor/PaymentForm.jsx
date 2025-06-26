import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import { dbHelpers } from '../../lib/supabase'
import { stripeHelpers } from '../../lib/stripe'

const PaymentForm = ({ package: pkg, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { profile } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Create payment intent
      const paymentIntentData = await stripeHelpers.createPaymentIntent(
        pkg.price_cents,
        'usd',
        {
          package_id: pkg.id,
          user_id: profile.id,
          package_name: pkg.name
        }
      )

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: profile.name,
              email: profile.email,
            },
          }
        }
      )

      if (stripeError) {
        throw stripeError
      }

      // Save payment record to database
      await dbHelpers.addPayment({
        user_id: profile.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: pkg.price_cents,
        currency: 'usd',
        status: paymentIntent.status,
        description: `Payment for ${pkg.name}`,
        metadata: {
          package_id: pkg.id,
          package_name: pkg.name
        }
      })

      onSuccess(paymentIntent)
    } catch (err) {
      setError(err.message)
      onError(err)
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {processing ? 'Processing...' : `Pay ${stripeHelpers.formatAmount(pkg.price_cents)}`}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>Your payment is secured by Stripe.</p>
        <p>You will be charged ${(pkg.price_cents / 100).toFixed(2)} for {pkg.duration_months} month(s) of advertising.</p>
      </div>
    </form>
  )
}

export default PaymentForm