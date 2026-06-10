// ReelRadar weekly updater — runs automatically via GitHub Actions.
// Fetches latest theatre releases + OTT/streaming releases from TMDB (free API)
// and writes data.json which the website reads. No manual work needed.

const API_KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

if (!API_KEY) {
  console.error("Missing TMDB_API_KEY. Add it in GitHub repo Settings → Secrets.");
  process.exit(1);
}

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`);
  return res.json();
}

function verdict(rating, votes) {
  if (!votes || votes < 10) return "Too new for a verdict";
  if (rating >= 7.5) return "Must watch";
  if (rating >= 6.5) return "Worth a watch";
  if (rating >= 5.5) return "Decent one-time watch";
  return "Skip unless curious";
}

function trim(text, n = 160) {
  if (!text) return "";
  return text.length <= n ? text : text.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

const LANG = { en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", ml: "Malayalam", kn: "Kannada", ko: "Korean", ja: "Japanese", es: "Spanish", fr: "French", mr: "Marathi", bn: "Bengali", pa: "Punjabi" };

async function main() {
  // Genre name lookups
  const [movieGenres, tvGenres] = await Promise.all([
    tmdb("/genre/movie/list"), tmdb("/genre/tv/list"),
  ]);
  const gmap = {};
  for (const g of [...movieGenres.genres, ...tvGenres.genres]) gmap[g.id] = g.name;
  const genres = (ids) => (ids || []).slice(0, 2).map((i) => gmap[i]).filter(Boolean).join(" / ");

  // ---------- TOP 5 IN THEATRES (India region) ----------
  const nowPlaying = await tmdb("/movie/now_playing", { region: "IN", page: "1" });
  const theatres = nowPlaying.results
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5)
    .map((m) => ({
      title: m.title,
      platform: "Theatres",
      genre: genres(m.genre_ids),
      language: LANG[m.original_language] || m.original_language,
      released: m.release_date,
      review: trim(m.overview),
      scores: [{ source: "TMDB", score: m.vote_count >= 10 ? `${m.vote_average.toFixed(1)}/10` : "New release" }],
      verdict: verdict(m.vote_average, m.vote_count),
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
    }));

  // ---------- TOP 10 ON OTT (trending movies + shows with IN streaming providers) ----------
  const [trMovies, trTv] = await Promise.all([
    tmdb("/trending/movie/week"), tmdb("/trending/tv/week"),
  ]);
  const candidates = [
    ...trMovies.results.map((m) => ({ ...m, kind: "movie" })),
    ...trTv.results.map((t) => ({ ...t, kind: "tv" })),
  ].sort((a, b) => b.popularity - a.popularity);

  const ott = [];
  for (const c of candidates) {
    if (ott.length >= 10) break;
    try {
      const prov = await tmdb(`/${c.kind}/${c.id}/watch/providers`);
      const inProv = prov.results?.IN?.flatrate;
      if (!inProv || inProv.length === 0) continue; // not streaming in India yet
      ott.push({
        title: c.title || c.name,
        platform: inProv[0].provider_name,
        genre: genres(c.genre_ids),
        language: LANG[c.original_language] || c.original_language,
        released: c.release_date || c.first_air_date,
        review: trim(c.overview),
        scores: [{ source: "TMDB", score: c.vote_count >= 10 ? `${c.vote_average.toFixed(1)}/10` : "New release" }],
        verdict: verdict(c.vote_average, c.vote_count),
        poster: c.poster_path ? `https://image.tmdb.org/t/p/w342${c.poster_path}` : null,
      });
    } catch { /* skip items that fail */ }
  }

  const data = {
    generatedAt: new Date().toISOString(),
    theatres,
    ott,
  };

  const fs = await import("fs");
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
  console.log(`Done. ${theatres.length} theatre + ${ott.length} OTT titles written to data.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
