import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured in environment variables");
  }
  return neon(url);
}

export interface DbUserProfile {
  user_id: string;
  plan: "free" | "pro";
  free_seconds_remaining: number;
  last_noon_reset: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface DbActionStep {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  checked: boolean;
  user_reflection: string | null;
  pro_feedback: string | null;
  verified_at: string | null;
}

export interface DbCoachMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  is_pro_analysis: boolean;
  created_at: string;
}

export interface DbJournalAttachment {
  id: string;
  title: string;
  notes: string | null;
  object_key: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

const TOTAL_FREE_SECONDS = 600;

/**
 * Computes the timestamp of the most recent daily 12:00 PM (noon) boundary.
 */
function getMostRecentNoonBoundary(now = new Date()): Date {
  const boundary = new Date(now);
  boundary.setHours(12, 0, 0, 0);
  if (now.getTime() < boundary.getTime()) {
    boundary.setDate(boundary.getDate() - 1);
  }
  return boundary;
}

/**
 * Ensures the user profile exists and applies daily noon (12:00 PM) reset if needed.
 */
export async function ensureUserProfile(userId: string): Promise<DbUserProfile> {
  const sql = getSql();

  await sql`
    INSERT INTO user_profiles (user_id, plan, free_seconds_remaining, last_noon_reset)
    VALUES (${userId}, 'free', ${TOTAL_FREE_SECONDS}, NOW())
    ON CONFLICT (user_id) DO NOTHING
  `;

  const rows = await sql`
    SELECT user_id, plan, free_seconds_remaining, last_noon_reset, stripe_customer_id, stripe_subscription_id
    FROM user_profiles
    WHERE user_id = ${userId}
  `;

  const profile = rows[0] as DbUserProfile;
  const effectiveNoon = getMostRecentNoonBoundary();
  const lastReset = new Date(profile.last_noon_reset);

  if (lastReset.getTime() < effectiveNoon.getTime()) {
    const updated = await sql`
      UPDATE user_profiles
      SET free_seconds_remaining = ${TOTAL_FREE_SECONDS},
          last_noon_reset = NOW(),
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING user_id, plan, free_seconds_remaining, last_noon_reset, stripe_customer_id, stripe_subscription_id
    `;
    return updated[0] as DbUserProfile;
  }

  return profile;
}

export async function updateUserPlan(
  userId: string,
  plan: "free" | "pro",
  stripeCustomerId?: string | null,
  stripeSubscriptionId?: string | null
): Promise<DbUserProfile> {
  const sql = getSql();
  await ensureUserProfile(userId);

  const rows = await sql`
    UPDATE user_profiles
    SET plan = ${plan},
        stripe_customer_id = COALESCE(${stripeCustomerId ?? null}, stripe_customer_id),
        stripe_subscription_id = COALESCE(${stripeSubscriptionId ?? null}, stripe_subscription_id),
        updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING user_id, plan, free_seconds_remaining, last_noon_reset, stripe_customer_id, stripe_subscription_id
  `;
  return rows[0] as DbUserProfile;
}

export async function updateUserQuota(
  userId: string,
  freeSecondsRemaining: number,
  resetTimestamp?: string
): Promise<DbUserProfile> {
  const sql = getSql();
  await ensureUserProfile(userId);

  const clamped = Math.max(0, Math.min(TOTAL_FREE_SECONDS, Math.floor(freeSecondsRemaining)));

  const rows = resetTimestamp
    ? await sql`
        UPDATE user_profiles
        SET free_seconds_remaining = ${clamped},
            last_noon_reset = ${resetTimestamp}::timestamptz,
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING user_id, plan, free_seconds_remaining, last_noon_reset, stripe_customer_id, stripe_subscription_id
      `
    : await sql`
        UPDATE user_profiles
        SET free_seconds_remaining = ${clamped},
            updated_at = NOW()
        WHERE user_id = ${userId}
        RETURNING user_id, plan, free_seconds_remaining, last_noon_reset, stripe_customer_id, stripe_subscription_id
      `;
  return rows[0] as DbUserProfile;
}

export async function getCompletedLessons(userId: string): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT lesson_id
    FROM completed_lessons
    WHERE user_id = ${userId}
    ORDER BY completed_at ASC
  `;
  return rows.map((r) => String(r.lesson_id));
}

export async function addCompletedLesson(userId: string, lessonId: string): Promise<string[]> {
  const sql = getSql();
  await ensureUserProfile(userId);
  await sql`
    INSERT INTO completed_lessons (user_id, lesson_id)
    VALUES (${userId}, ${lessonId})
    ON CONFLICT (user_id, lesson_id) DO NOTHING
  `;
  return getCompletedLessons(userId);
}

export async function getActionSteps(userId: string): Promise<DbActionStep[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, lesson_id, title, description, checked, user_reflection, pro_feedback, verified_at
    FROM action_steps
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  return rows as DbActionStep[];
}

export async function upsertActionStep(
  userId: string,
  step: {
    id: string;
    lessonId: string;
    title: string;
    description: string;
    checked: boolean;
    userReflection?: string;
    proFeedback?: string;
    verifiedAt?: string;
  }
): Promise<DbActionStep[]> {
  const sql = getSql();
  await ensureUserProfile(userId);
  await sql`
    INSERT INTO action_steps (id, user_id, lesson_id, title, description, checked, user_reflection, pro_feedback, verified_at, updated_at)
    VALUES (
      ${step.id},
      ${userId},
      ${step.lessonId},
      ${step.title},
      ${step.description},
      ${step.checked},
      ${step.userReflection ?? null},
      ${step.proFeedback ?? null},
      ${step.verifiedAt ?? null}::timestamptz,
      NOW()
    )
    ON CONFLICT (user_id, id) DO UPDATE SET
      checked = EXCLUDED.checked,
      user_reflection = COALESCE(EXCLUDED.user_reflection, action_steps.user_reflection),
      pro_feedback = COALESCE(EXCLUDED.pro_feedback, action_steps.pro_feedback),
      verified_at = COALESCE(EXCLUDED.verified_at, action_steps.verified_at),
      updated_at = NOW()
  `;
  return getActionSteps(userId);
}

export async function saveCoachMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
  isProAnalysis = false
): Promise<void> {
  const sql = getSql();
  await ensureUserProfile(userId);
  await sql`
    INSERT INTO coach_messages (user_id, role, content, is_pro_analysis)
    VALUES (${userId}, ${role}, ${content}, ${isProAnalysis})
  `;
}

export async function getCoachMessages(userId: string, limit = 50): Promise<DbCoachMessage[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, role, content, is_pro_analysis, created_at
    FROM coach_messages
    WHERE user_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT ${limit}
  `;
  return (rows as DbCoachMessage[]).reverse();
}

export async function createJournalAttachment(
  userId: string,
  entry: {
    id: string;
    title: string;
    notes?: string;
    objectKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }
): Promise<DbJournalAttachment> {
  const sql = getSql();
  await ensureUserProfile(userId);
  const rows = await sql`
    INSERT INTO journal_attachments (id, user_id, title, notes, object_key, file_name, mime_type, size_bytes)
    VALUES (${entry.id}, ${userId}, ${entry.title}, ${entry.notes ?? null}, ${entry.objectKey}, ${entry.fileName}, ${entry.mimeType}, ${entry.sizeBytes})
    RETURNING id, title, notes, object_key, file_name, mime_type, size_bytes, created_at
  `;
  return rows[0] as DbJournalAttachment;
}

export async function listJournalAttachments(userId: string, limit = 20): Promise<DbJournalAttachment[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, notes, object_key, file_name, mime_type, size_bytes, created_at
    FROM journal_attachments
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as DbJournalAttachment[];
}

export async function deleteJournalAttachment(userId: string, id: string): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM journal_attachments
    WHERE user_id = ${userId} AND id = ${id}
    RETURNING object_key
  `;
  return rows[0]?.object_key ? String(rows[0].object_key) : null;
}

export async function checkPostgresHealth(): Promise<{ ok: boolean; now: string; branch?: string }> {
  const sql = getSql();
  const rows = await sql`SELECT NOW() AS now`;
  return {
    ok: true,
    now: String(rows[0].now),
    branch: process.env.NEON_BRANCH,
  };
}
