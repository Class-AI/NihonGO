import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Hosts without a database (e.g. a free Vercel deploy) still run the app; progress is then stored on the device.
  if (!process.env.DATABASE_URL) return Response.json({ ok: true, database: "not-configured" });
  try {
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
