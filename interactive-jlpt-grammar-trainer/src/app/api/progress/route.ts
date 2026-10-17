import { and, eq, sql } from "drizzle-orm";
import { progress } from "@/db/schema";

export const dynamic = "force-dynamic";

// The database is optional: without DATABASE_URL the app still works and progress lives on the device.
const hasDb = () => !!process.env.DATABASE_URL;
const getDb = async () => (await import("@/db")).db;

function validUser(u: unknown): u is string {
  return typeof u === "string" && u.length >= 8 && u.length <= 64;
}

export async function GET(req: Request) {
  const user = new URL(req.url).searchParams.get("user");
  if (!validUser(user)) return Response.json({ error: "user required" }, { status: 400 });
  if (!hasDb()) return Response.json({ rows: [], storage: "device" });
  try {
    const db = await getDb();
    const rows = await db.select().from(progress).where(eq(progress.userKey, user));
    return Response.json({ rows, storage: "server" });
  } catch (e) {
    console.error("progress GET failed", e);
    return Response.json({ rows: [], storage: "device", error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    user?: string;
    itemId?: string;
    learned?: boolean;
    quizScore?: number | null;
    speakingScore?: number | null;
    completed?: boolean;
  };
  if (!validUser(body.user) || typeof body.itemId !== "string" || !body.itemId || body.itemId.length > 80) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  if (!hasDb()) return Response.json({ ok: true, storage: "device" });

  const learned = !!body.learned;
  const completed = !!body.completed;
  const quiz = typeof body.quizScore === "number" ? Math.round(body.quizScore) : null;
  const speak = typeof body.speakingScore === "number" ? Math.round(body.speakingScore) : null;

  try {
    const db = await getDb();
    const [row] = await db
      .insert(progress)
      .values({ userKey: body.user, itemId: body.itemId, learned, completed, quizScore: quiz, speakingScore: speak })
      .onConflictDoUpdate({
        target: [progress.userKey, progress.itemId],
        set: {
          learned: sql`${progress.learned} OR ${learned}`,
          completed: sql`${progress.completed} OR ${completed}`,
          quizScore: quiz === null ? sql`${progress.quizScore}` : sql`GREATEST(COALESCE(${progress.quizScore}, 0), ${quiz})`,
          speakingScore: speak === null ? sql`${progress.speakingScore}` : sql`GREATEST(COALESCE(${progress.speakingScore}, 0), ${speak})`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return Response.json({ row, storage: "server" });
  } catch (e) {
    console.error("progress POST failed", e);
    return Response.json({ ok: false, error: "database unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  const item = url.searchParams.get("item");
  if (!validUser(user)) return Response.json({ error: "user required" }, { status: 400 });
  if (!hasDb()) return Response.json({ ok: true, storage: "device" });
  try {
    const db = await getDb();
    if (item) await db.delete(progress).where(and(eq(progress.userKey, user), eq(progress.itemId, item)));
    else await db.delete(progress).where(eq(progress.userKey, user));
    return Response.json({ ok: true });
  } catch (e) {
    console.error("progress DELETE failed", e);
    return Response.json({ ok: false, error: "database unavailable" }, { status: 503 });
  }
}
