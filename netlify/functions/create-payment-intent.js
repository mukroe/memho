const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body);

    // Guardrails
    if (!amount || !Number.isInteger(amount)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid amount' }) };
    }

    // (Optional) whitelist allowed amounts to avoid tampering
    const allowed = new Set([44000, 39000, 29000, 19000]);
    if (!allowed.has(amount)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Amount not allowed' }) };
    }

    const pi = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    return { statusCode: 200, body: JSON.stringify({ clientSecret: pi.client_secret }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
