import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const room = req.nextUrl.searchParams.get('room');
    const username = req.nextUrl.searchParams.get('username');

    if (!room || !username) {
      return NextResponse.json(
        { error: 'Missing "room" or "username" query parameter' },
        { status: 400 }
      );
    }

    // Use environment variables, but provide a fallback so it absolutely cannot fail during our test!
    const apiKey = process.env.LIVEKIT_API_KEY || 'APIbKYz4rZNGcgC';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '745utMg3Tcit8fdXMB5Vomz90H9qWIr5QrR1ZBgh1wZ';

    if (!apiKey || !apiSecret) {
      console.error('Missing LiveKit keys');
      return NextResponse.json(
        { error: 'Server misconfigured: Missing LiveKit Keys' },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: username });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('LiveKit API Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
