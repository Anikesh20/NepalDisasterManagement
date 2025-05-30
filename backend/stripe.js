const Stripe = require('stripe');

const stripe = new Stripe('sk_test_51RH1RtLnm2eBVvTqpmkvdhMDNJCmRvWOG712oJNJPWCnirbTmZ0CwMT7Em84zy7u7kZ1bJQATnYSovfFyjNnw7Oc00fec8pbfS', {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Create a payment intent
const createPaymentIntent = async (amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit (paise for NPR)
      currency: 'npr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm a payment intent
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
}; 