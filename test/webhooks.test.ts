
import 'dotenv/config'
import { Buffer } from 'buffer';
import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'

import { RequestMethod, createMocks } from 'node-mocks-http'
import stripeMock from './helpers/stripe'
import { POST } from '../src/app/api/webhooks/stripe/route'

jest.doMock('stripe', () => {
  return jest.fn(() => stripeMock)
})

function mockRequestResponse(method: RequestMethod = 'POST') {
  const { req }: { req: any; res: NextResponse } = createMocks({ method });
  return { req };
}

const unixtime = Math.floor(new Date().getTime() / 1000)
const stripeWebhookSecret = 'whsec_'

describe('/webhooks/stripe', () => {
  let req: any
  beforeAll(async () => {
    const ctx = mockRequestResponse('POST')
    req = ctx.req
  })

  test.each([
    'customer_updated.json',
  
    'product_created.json',
    'product_deleted.json',
    'product_updated.json',
   
    'price_created.json',
    'price_deleted.json',
    'price_updated.json',
     
    'plan_created.json',
    'plan_deleted.json',
    'plan_updated.json',

    'invoice_paid.json',
    'invoice_updated.json',
    'invoice_finalized.json',
    
    'setup_intent_canceled.json',
    'setup_intent_created.json',
    'setup_intent_requires_action.json',
    'setup_intent_setup_failed.json',
    'setup_intent_succeeded.json',

    'charge_captured.json',
    'charge_expired.json',
    'charge_failed.json',

    'subscription_created.json',
    'subscription_deleted.json',
    'subscription_updated.json',

    'payment_method_attached.json',
    'payment_method_automatically_updated.json',
    'payment_method_detached.json',
    'payment_method_updated.json',
   
    'payment_intent_amount_capturable_updated.json',
    'payment_intent_canceled.json',
    'payment_intent_created.json',
    'payment_intent_partially_funded.json',
    'payment_intent_payment_failed.json',
    'payment_intent_processing.json',
    'payment_intent_requires_action.json',
    'payment_intent_succeeded.json',

    'payment_method_attached.json',
    'payment_method_automatically_updated.json',
    'payment_method_detached.json',
    'payment_method_updated.json',

    'charge_pending.json',
    'charge_refunded.json',
    'charge_succeeded.json',
    'charge_updated.json',
    
    
    'charge_dispute_closed.json',
    'charge_dispute_created.json',
    'charge_dispute_funds_reinstated.json',
    'charge_dispute_funds_withdrawn.json',
    'charge_dispute_updated.json',
  ])('process event %s', async (jsonFile) => {

    const eventBody = await import(`./stripe/${jsonFile}`).then(({ default: myData }) => myData)

    const signature = createHmac('sha256', stripeWebhookSecret)
      .update(`${unixtime}.${JSON.stringify(eventBody)}`, 'utf8')
      .digest('hex')
   
    req.url = `/webhooks/stripe`
    req.headers = { 'stripe-signature': `t=${unixtime},v1=${signature},v0=ff` }
    req.body = await Buffer.from(JSON.stringify(eventBody), 'utf8')

    const res = await POST(req)
    const json = await res.json();
    if (json.error) {
      console.log('error: ', json.message)
    }

    expect(res.status).toBe(200)
    expect(json).toMatchObject({ received: true })
  })
})
