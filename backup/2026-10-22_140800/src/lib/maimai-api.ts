/**
 * Maimai DX External API Client Connector
 * Handles connections to external Maimai score scraping APIs or fallback pipelines.
 */

export interface ExternalMaimaiProfile {
  segaId: string;
  nickname: string;
  rating: number;
  trophy: string;
  plate: string;
}

export interface ExternalMaimaiScore {
  songTitle: string;
  difficulty: "Basic" | "Advanced" | "Expert" | "Master" | "Re:Master";
  level: string; // e.g., "13", "14+"
  achievement: number; // e.g., 100.8524
  clearType: "CLEAR" | "FC" | "FCP" | "AP" | "APP" | "SYNC";
  liked: boolean;
  playCount: number;
}

export interface ExternalMaimaiPayload {
  success: boolean;
  profile: ExternalMaimaiProfile;
  scores: ExternalMaimaiScore[];
}

/**
 * Transforms external payload structures into Drizzle SQLite ORM schemas safely.
 */
export function transformExternalScore(
  userId: string,
  ext: ExternalMaimaiScore
) {
  // Generate a deterministic and clean ID to prevent duplicate score rows during upserts
  const deterministicId = `${userId}_${ext.songTitle.replace(/\s+/g, "_")}_${ext.difficulty}`;

  return {
    id: deterministicId,
    userId,
    songTitle: ext.songTitle,
    difficulty: ext.difficulty,
    level: ext.level,
    achievement: Number(ext.achievement.toFixed(4)), // Maintain float precision up to 4 decimals
    clearType: ext.clearType,
    liked: ext.liked ? 1 : 0, // SQLite integer mapping (0 or 1)
    playCount: ext.playCount,
  };
}

/**
 * Connects and fetches live telemetry scores from an external Maimai DX scraper service.
 */
export async function fetchLiveMaimaiScores(segaId: string): Promise<ExternalMaimaiPayload> {
  try {
    // In a production server, this fetches from the SEGA Maimai DX Net scraper service:
    // const res = await fetch(`https://api.maimai-net.scraper/v1/scores?segaId=${encodeURIComponent(segaId)}`);
    // if (!res.ok) throw new Error("Scraper failed to pull session cookie");
    // return await res.json();
    
    // For demonstration, we simulate a latency fetch to a scraper API, producing
    // a highly realistic, full-fidelity database response for popular Maimai songs.
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Latency gap

    const popularSongs: Omit<ExternalMaimaiScore, "liked" | "playCount">[] = [
      { songTitle: "Oshama Scramble!", difficulty: "Master", level: "13+", achievement: 100.8532, clearType: "AP" },
      { songTitle: "Garakuta Doll Play", difficulty: "Master", level: "13", achievement: 99.8241, clearType: "FC" },
      { songTitle: "Freedom Dive", difficulty: "Re:Master", level: "14+", achievement: 98.4125, clearType: "CLEAR" },
      { songTitle: "Pandora Paradoxxx", difficulty: "Master", level: "15", achievement: 95.8451, clearType: "CLEAR" },
      { songTitle: "Glorious Crown", difficulty: "Master", level: "14", achievement: 100.2541, clearType: "FCP" },
      { songTitle: "Caliburne", difficulty: "Master", level: "13+", achievement: 100.9125, clearType: "APP" },
      { songTitle: "Jack-the-Ripper◆", difficulty: "Expert", level: "12", achievement: 101.0000, clearType: "AP" },
      { songTitle: "Alethea", difficulty: "Master", level: "14", achievement: 99.1125, clearType: "FC" },
      { songTitle: "L'épilogue", difficulty: "Master", level: "14+", achievement: 97.8541, clearType: "CLEAR" },
      { songTitle: "Ourren", difficulty: "Master", level: "14", achievement: 100.1245, clearType: "FC" },
      { songTitle: "QZKago Requiem", difficulty: "Master", level: "14+", achievement: 98.9812, clearType: "CLEAR" },
      { songTitle: "System Normal", difficulty: "Expert", level: "11+", achievement: 100.5412, clearType: "FCP" },
      { songTitle: "Temptation", difficulty: "Master", level: "13+", achievement: 99.4125, clearType: "FC" },
      { songTitle: "Brave Dog", difficulty: "Advanced", level: "8", achievement: 101.0000, clearType: "AP" },
      { songTitle: "Nijisaki Orbit", difficulty: "Master", level: "12+", achievement: 100.7512, clearType: "APP" },
    ];

    // Seed realistic like configurations and play counts
    const scores: ExternalMaimaiScore[] = popularSongs.map((song) => ({
      ...song,
      liked: Math.random() > 0.45, // Dynamic likes
      playCount: Math.floor(Math.random() * 25) + 3,
    }));

    // Generate plate and nickname matching the theme
    return {
      success: true,
      profile: {
        segaId,
        nickname: "ANTIGRAVITY",
        rating: 15420, // High-tier gold/rainbow rating
        trophy: "Defier of Spatial Velocities",
        plate: "Maimai DX Buddies Plus",
      },
      scores,
    };
  } catch (error) {
    console.error("External Maimai API pull error:", error);
    throw new Error("Failed to synchronize with SEGA ID Net Scraper");
  }
}
