import { NextResponse, NextRequest } from 'next/server'
 
import getConfig from 'next/config'
import {stripe} from '../../../utils/StripeClientManager'
import Stripe from 'stripe';

const config = getConfig();

export default async function POST(req: NextRequest) {
  const sig = req.headers['stripe-signature'] as string
  const body: { raw: Buffer } = req.body as { raw: Buffer }

  let event
  try {
    event = stripe.webhooks.constructEvent(body.raw, sig, config.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, {status: 400})
  }


  switch (event.type) {
    case 'charge.captured':
    case 'charge.expired':
    case 'charge.failed':
    case 'charge.pending':
    case 'charge.refunded':
    case 'charge.succeeded':
    case 'charge.updated': {
      const charge = event.data.object as Stripe.Charge
      await upsertCharges([charge])
      break
    }
    case 'customer.created':
    case 'customer.updated': {
      const customer = event.data.object as Stripe.Customer
      await upsertCustomers([customer])
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.deleted': // Soft delete using `status = canceled`
    case 'customer.subscription.paused':
    case 'customer.subscription.pending_update_applied':
    case 'customer.subscription.pending_update_expired':
    case 'customer.subscription.resumed':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await upsertSubscriptions([subscription])
      break
    }
    case 'invoice.created':
    case 'invoice.finalized':
    case 'invoice.paid':
    case 'invoice.payment_failed':
    case 'invoice.payment_succeeded':
    case 'invoice.updated': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoices([invoice])
      break
    }
    case 'product.created':
    case 'product.updated': {
      const product = event.data.object as Stripe.Product
      await upsertProducts([product])
      break
    }
    case 'product.deleted': {
      const product = event.data.object as Stripe.Product
      await deleteProduct(product.id)
      break
    }
    case 'price.created':
    case 'price.updated': {
      const price = event.data.object as Stripe.Price
      await upsertPrices([price])
      break
    }
    case 'price.deleted': {
      const price = event.data.object as Stripe.Price
      await deletePrice(price.id)
      break
    }
    case 'plan.created':
    case 'plan.updated': {
      const plan = event.data.object as Stripe.Plan
      await upsertPlans([plan])
      break
    }
    case 'plan.deleted': {
      const plan = event.data.object as Stripe.Plan
      await deletePlan(plan.id)
      break
    }
    case 'setup_intent.canceled':
    case 'setup_intent.created':
    case 'setup_intent.requires_action':
    case 'setup_intent.setup_failed':
    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object as Stripe.SetupIntent

      await upsertSetupIntents([setupIntent])
      break
    }
    case 'payment_method.attached':
    case 'payment_method.automatically_updated':
    case 'payment_method.detached':
    case 'payment_method.updated': {
      const paymentMethod = event.data.object as Stripe.PaymentMethod

      await upsertPaymentMethods([paymentMethod])
      break
    }
    case 'charge.dispute.closed':
    case 'charge.dispute.created':
    case 'charge.dispute.funds_reinstated':
    case 'charge.dispute.funds_withdrawn':
    case 'charge.dispute.updated':
    case 'charge.dispute.closed': {
      const dispute = event.data.object as Stripe.Dispute

      await upsertDisputes([dispute])
      break
    }
    case 'payment_intent.amount_capturable_updated':
    case 'payment_intent.canceled':
    case 'payment_intent.created':
    case 'payment_intent.partially_funded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.processing':
    case 'payment_intent.requires_action':
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      await upsertPaymentIntents([paymentIntent])
      break
    }

    default:
      throw new Error('Unhandled webhook event')
  }

  return NextResponse.json({ received: true })
}