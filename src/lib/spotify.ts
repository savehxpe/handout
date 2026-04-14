const SPOTIFY_API = "https://api.spotify.com/v1";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

export type SpotifyImage = { url: string; width: number; height: number };

export type SpotifyArtist = {
  id: string;
  name: string;
  followers: { total: number };
  genres: string[];
  images: SpotifyImage[];
  external_urls: { spotify: string };
};

export type SpotifyTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: { spotify: string };
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    release_date: string;
  };
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  total_tracks: number;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET");

  const creds = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Spotify ${path} HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export async function getArtist(artistId: string): Promise<SpotifyArtist> {
  return spotifyGet<SpotifyArtist>(`/artists/${artistId}`);
}

export async function getArtistTopTracks(
  artistId: string,
  market: string = "US",
): Promise<SpotifyTrack[]> {
  const data = await spotifyGet<{ tracks: SpotifyTrack[] }>(
    `/artists/${artistId}/top-tracks?market=${market}`,
  );
  return data.tracks;
}

type AlbumTrack = {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: { spotify: string };
  track_number: number;
};

export async function getAlbumTracks(albumId: string): Promise<AlbumTrack[]> {
  const data = await spotifyGet<{ items: AlbumTrack[] }>(
    `/albums/${albumId}/tracks?limit=20`,
  );
  return data.items;
}

export async function getLatestReleaseTracks(
  artistId: string,
  limit: number = 10,
): Promise<SpotifyTrack[]> {
  const albums = await getArtistAlbums(artistId, 1);
  if (!albums.length) return [];
  const latest = albums[0];
  const tracks = await getAlbumTracks(latest.id);
  return tracks.slice(0, limit).map((t) => ({
    id: t.id,
    name: t.name,
    preview_url: t.preview_url,
    duration_ms: t.duration_ms,
    external_urls: t.external_urls,
    album: {
      id: latest.id,
      name: latest.name,
      images: latest.images,
      release_date: latest.release_date,
    },
  }));
}

export async function getArtistAlbums(
  artistId: string,
  limit: number = 10,
): Promise<SpotifyAlbum[]> {
  const params = new URLSearchParams({
    include_groups: "album,single",
    limit: String(Math.min(limit, 10)),
  });
  const data = await spotifyGet<{ items: SpotifyAlbum[] }>(
    `/artists/${artistId}/albums?${params.toString()}`,
  );
  return data.items;
}

export type ArtistPayload = {
  artist: SpotifyArtist;
  topTracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
};

export async function getArtistPayload(artistId: string): Promise<ArtistPayload> {
  const [artist, albums] = await Promise.all([
    getArtist(artistId),
    getArtistAlbums(artistId, 10),
  ]);
  let topTracks: SpotifyTrack[] = [];
  try {
    topTracks = await getArtistTopTracks(artistId);
  } catch {
    topTracks = await getLatestReleaseTracks(artistId, 10);
  }
  return { artist, topTracks, albums };
}
