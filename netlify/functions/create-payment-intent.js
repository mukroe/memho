const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    // Parse request body
    const data = JSON.parse(event.body || '{}');
    const amount = data.amount;

    if (!amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required param: amount' }),
      };
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,          // in cents, e.g., 1000 = $10.00
      currency: 'usd', // change if needed
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };

  } catch (error) {
    console.error('Stripe Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
