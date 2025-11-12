// netlify/functions/process-order.js
import Stripe from "stripe";
import sgMail from "@sendgrid/mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    // 1️⃣ Send email with order details
    const msg = {
      to: "info@thememoryhouse.art",
      from: "orders@thememoryhouse.art",
      subject: "New Memory House Order",
      text: `
Name: ${data.name}
Email: ${data.email}
Address: ${data.address}
Size: ${data.size}
Notes: ${data.notes}
      `,
    };
    await sgMail.send(msg);

    // 2️⃣ Create Stripe Payment Intent
    const priceMap = { "Premium Gift Package": 44000, "18×24": 39000, "12×18": 29000, "8×10": 19000 };
    const amount = priceMap[data.size] || 0;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: data.email,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
