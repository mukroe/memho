
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context) {
  try {
    const data = JSON.parse(event.body);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: 'usd',
      automatic_payment_methods: {enabled: true},
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
