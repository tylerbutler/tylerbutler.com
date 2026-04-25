const NAMES: Record<string, string> = {
  aquarius: "Aquarius",
  aries: "Aries",
  "berenices-hair": "Coma Berenices",
  camelopardus: "Camelopardalis",
  cancer: "Cancer",
  cepheus: "Cepheus",
  crater: "Crater",
  crow: "Corvus",
  crux: "Crux",
  dolphin: "Delphinus",
  gemini: "Gemini",
  harp: "Lyra",
  leo: "Leo",
  libra: "Libra",
  "little-bear": "Ursa Minor",
  pavo: "Pavo",
  pisces: "Pisces",
  "queen-cassiopeia": "Cassiopeia",
  sagittarius: "Sagittarius",
  scorpio: "Scorpius",
  "southern-fish": "Piscis Austrinus",
  taurus: "Taurus",
  telescopium: "Telescopium",
  "triangulum-australe": "Triangulum Australe",
  "ursa-minor": "Ursa Minor",
  virgo: "Virgo",
  volans: "Volans",
};

/**
 * Returns the Latin constellation name for a slug (e.g. "berenices-hair" → "Coma Berenices").
 * Falls back to the slug itself if not found.
 */
export function getConstellationName(slug: string): string {
  return NAMES[slug] ?? slug;
}
