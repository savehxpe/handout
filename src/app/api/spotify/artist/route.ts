import { NextResponse } from "next/server";
import { getArtistPayload } from "@/lib/spotify";

export const revalidate = 3600;

export async function GET() {
  const artistId = process.env.SPOTIFY_ARTIST_ID;
  if (!artistId) {
    return NextResponse.json({ error: "Missing SPOTIFY_ARTIST_ID" }, { status: 500 });
  }
  try {
    const payload = await getArtistPayload(artistId);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
