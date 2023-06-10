import {GET} from '../src/app/api/health/route'
import { NextResponse } from 'next/server';

describe('/health', () => {
  test('is alive', async () => {
    const response: NextResponse = await GET();
    const json = await response.json();

    expect(response.status).toBe(200)
    expect(json).toMatchObject({ received: true })
  })
})
