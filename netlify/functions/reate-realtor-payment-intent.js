// netlify/functions/create-realtor-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);

exports.handler = async (event) => {
  try {
    const { product } = JSON.parse(event.body);

    // Map your realtor products to prices in cents
    const priceMap = {
      full: 44000,          // $440.00
      full_rush: 49000      // $440 + $50 rush
    };

    const amount = priceMap[product] || priceMap.full;

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
