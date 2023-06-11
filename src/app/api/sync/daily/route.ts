import { NextRequest, NextResponse } from 'next/server'
import { syncBackfill, SyncBackfillParams } from '../../../../lib/sync'
import { verifyApiKey } from '../../../../utils/verifyApiKey'

export async function POST(req: NextRequest) {
  const { code, data } = await verifyApiKey(req)

  if (code != 200) {
    return NextResponse.json(data, { status: code })
  }

  const { object } = (req.body as { object?: string }) ?? {}
  const currentTimeInSeconds = Math.floor(Date.now() / 1000)
  const dayAgoTimeInSeconds = currentTimeInSeconds - 60 * 60 * 24
  const params = {
    created: { gte: dayAgoTimeInSeconds },
    object: object ?? 'all',
  } as SyncBackfillParams

  await syncBackfill(params)

  return NextResponse.json({ ts: Date.now() }, { status: 200 })
}
