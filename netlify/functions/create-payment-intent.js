const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    let amount = 0;

    // Try reading from POST body
    if (event.body) {
      try {
        const data = JSON.parse(event.body);
        amount = data.amount || 0;
      } catch (err) {
        console.warn("Body parse failed:", err);
      }
    }

    // Fallback to query param (GET)
    if (!amount && event.queryStringParameters?.amount) {
      amount = parseInt(event.queryStringParameters.amount);
    }

    if (!amount || isNaN(amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid amount" }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
