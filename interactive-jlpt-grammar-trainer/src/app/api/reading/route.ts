import path from "node:path";
import kuromoji from "kuromoji";
import { readingFromTokens, type Tok } from "@/lib/reading-fix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

const g = globalThis as typeof globalThis & { __kuroPromise?: Promise<Tokenizer> };

function getTokenizer(): Promise<Tokenizer> {
  if (!g.__kuroPromise) {
    g.__kuroPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: path.join(process.cwd(), "node_modules", "kuromoji", "dict") })
        .build((err, tokenizer) => {
          if (err) {
            g.__kuroPromise = undefined;
            reject(err);
          } else resolve(tokenizer);
        });
    });
  }
  return g.__kuroPromise;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = (body.text ?? "").slice(0, 1000);
    if (!text.trim()) return Response.json({ reading: "" });
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text) as unknown as Tok[];
    return Response.json({ reading: readingFromTokens(tokens) });
  } catch (e) {
    console.error("reading error", e);
    return Response.json({ reading: "", error: "conversion failed" }, { status: 500 });
  }
}
