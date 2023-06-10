import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/src/utils/verifyApiKey'
import { NextApiRequest } from 'next'
import { syncSingleEntity } from '@/src/lib/sync'

export async function POST(req: NextApiRequest) {

    const {code, data} = verifyApiKey(req as unknown as NextRequest)

    if (code != 200) {
      return NextResponse.json(data, {status: code})
    }

    const stripeId = req.query.stripeId as string
    const result = await syncSingleEntity(stripeId)

    return NextResponse.json({  ts: Date.now(), data: result })
}
