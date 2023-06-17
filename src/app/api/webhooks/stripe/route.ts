import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from "next/headers"
import { getConfig } from '../../../../utils/config'
import { stripe } from '../../../../utils/StripeClientManager'
import { upsertCharges } from '../../../../lib/charges'
import { upsertCustomers } from '../../../../lib/customers'
import { upsertSubscriptions } from '../../../../lib/subscriptions'
import { upsertInvoices } from '../../../../lib/invoices'
import { deleteProduct, upsertProducts } from '../../../../lib/products'
import { deletePrice, upsertPrices } from '../../../../lib/prices'
import { deletePlan, upsertPlans } from '../../../../lib/plans'
import { upsertSetupIntents } from '../../../../lib/setup_intents'
import { upsertPaymentMethods } from '../../../../lib/payment_methods'
import { upsertDisputes } from '../../../../lib/disputes'
import { upsertPaymentIntents } from '../../../../lib/payment_intents'
import { NextApiRequest } from 'next'

const appConfig = getConfig()


export async function POST(req: NextApiRequest) {

  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
   event = await stripe.webhooks.constructEvent(buf, sig, appConfig.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
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
