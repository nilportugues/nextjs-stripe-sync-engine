import { SyncBackfillParams, syncBackfill } from '@/src/lib/sync'
import { verifyApiKey } from '@/src/utils/verifyApiKey'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const { code, data } = await verifyApiKey(req)

  if (code != 200) {
    return NextResponse.json(data, { status: code })
  }

  const { created, object } =
    (req.body as {
      created?: Stripe.RangeQueryParam
      object?: string
    }) ?? {}

  const params = { created, object } as SyncBackfillParams
  const result = await syncBackfill(params)

  return NextResponse.json({ ts: Date.now(), ...result }, { status: 200 })
}
