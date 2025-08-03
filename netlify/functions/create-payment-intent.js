const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 safe live test
      currency: 'usd',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
