import axios from 'axios';
import { createErrorCard } from './alertMsg';

const stripe = Stripe(
  'pk_test_51MaJRHIZoKpQ5jrWQN4FQUoATgd2Su33VaOFRPdlk5h2b1Nv5cMGdkSX2BQW88mAU80vjPhDRDUBBIPTQTLLJnMt00EkXJaaz9'
);

export const bookClass = async (teacherId, date, time) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${teacherId}/date/${date}/time/${time}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    console.log(session);
  } catch (err) {
    console.log(err);
    // add error msg here //
  }
};
