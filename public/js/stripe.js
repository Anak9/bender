import axios from 'axios';
import { createErrorCard } from './alertMsg';

const stripe = Stripe(
  'pk_test_51MaJRHIZoKpQ5jrWQN4FQUoATgd2Su33VaOFRPdlk5h2b1Nv5cMGdkSX2BQW88mAU80vjPhDRDUBBIPTQTLLJnMt00EkXJaaz9'
);

export const bookClass = async (
  teacherId,
  date,
  time,
  modality,
  groupClass
) => {
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${teacherId}/date/${date}/time/${time}/modality/${modality}/groupClass/${groupClass}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    // add error msg here //
  }
};
