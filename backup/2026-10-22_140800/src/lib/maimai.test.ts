import { test } from "node:test";
import assert from "node:assert";
import { transformExternalScore } from "./maimai-api";
import { getSessionCookieOptions } from "./auth";

test("maimai-api: transformExternalScore should map external fields correctly", () => {
  const userId = "user_uuid_12345";
  const externalScore = {
    songTitle: "Oshama Scramble!",
    difficulty: "Master" as const,
    level: "13+",
    achievement: 100.85324,
    clearType: "AP" as const,
    liked: true,
    playCount: 15,
  };

  const transformed = transformExternalScore(userId, externalScore);

  // Verify deterministic ID generation preventing overlaps
  assert.strictEqual(transformed.id, "user_uuid_12345_Oshama_Scramble!_Master");
  assert.strictEqual(transformed.userId, userId);
  assert.strictEqual(transformed.songTitle, "Oshama Scramble!");
  assert.strictEqual(transformed.difficulty, "Master");
  assert.strictEqual(transformed.level, "13+");
  
  // Verify precise float truncation up to 4 decimal places
  assert.strictEqual(transformed.achievement, 100.8532);
  assert.strictEqual(transformed.clearType, "AP");
  
  // Verify SQLite integer boolean conversion
  assert.strictEqual(transformed.liked, 1);
  assert.strictEqual(transformed.playCount, 15);
});

test("maimai-api: transformExternalScore should handle unliked and normal clear fields", () => {
  const userId = "user_uuid_999";
  const externalScore = {
    songTitle: "Freedom Dive",
    difficulty: "Re:Master" as const,
    level: "14+",
    achievement: 98.4125,
    clearType: "CLEAR" as const,
    liked: false,
    playCount: 2,
  };

  const transformed = transformExternalScore(userId, externalScore);

  assert.strictEqual(transformed.id, "user_uuid_999_Freedom_Dive_Re:Master");
  assert.strictEqual(transformed.achievement, 98.4125);
  assert.strictEqual(transformed.liked, 0);
  assert.strictEqual(transformed.playCount, 2);
});

test("auth: getSessionCookieOptions should return secure HTTP-only cookies configurations", () => {
  const opts = getSessionCookieOptions();

  assert.strictEqual(opts.name, "maimai_session");
  assert.strictEqual(opts.maxAge, 10 * 24 * 60 * 60); // 10 days in seconds
  assert.strictEqual(opts.httpOnly, true);
  assert.strictEqual(opts.path, "/");
  assert.strictEqual(opts.sameSite, "lax");
});
