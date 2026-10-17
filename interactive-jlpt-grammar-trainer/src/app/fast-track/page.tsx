import Link from "next/link";
import { getGrammar } from "@/data";

// Priority = patterns that appear again and again in JLPT N4/N3 grammar, reading and listening questions.
const N4_GRAMMAR = ["n4-02", "n4-04", "n4-05", "n4-12", "n4-16", "n4-20", "n4-14", "n4-41", "n4-42", "n4-43", "n4-44", "n4-45", "n4-11", "n4-18", "n4-19", "n4-17", "n4-34", "n4-35", "n4-37", "n4-23", "n4-22", "n4-09", "n4-08", "n4-53", "n4-51", "n4-52", "n4-31", "n4-32", "n4-26", "n4-27"];
const N3_GRAMMAR = ["n3-04", "n3-03", "n3-02", "n3-01", "n3-33", "n3-34", "n3-06", "n3-07", "n3-08", "n3-09", "n3-10", "n3-19", "n3-20", "n3-31", "n3-35", "n3-36", "n3-38", "n3-41", "n3-42", "n3-44", "n3-45", "n3-12", "n3-14", "n3-11", "n3-21", "n3-30", "n3-43", "n3-17"];

// [kanji word, reading, meaning]
const N4_KANJI: [string, string, string][] = [
  ["試験", "しけん", "exam"], ["準備", "じゅんび", "preparation"], ["予定", "よてい", "plan / schedule"], ["約束", "やくそく", "promise"], ["練習", "れんしゅう", "practice"], ["説明", "せつめい", "explanation"],
  ["質問", "しつもん", "question"], ["意見", "いけん", "opinion"], ["理由", "りゆう", "reason"], ["文化", "ぶんか", "culture"], ["結婚", "けっこん", "marriage"], ["注意", "ちゅうい", "caution"],
  ["連絡", "れんらく", "contact"], ["心配", "しんぱい", "worry"], ["安心", "あんしん", "relief"], ["運動", "うんどう", "exercise"], ["運転", "うんてん", "driving"], ["会議", "かいぎ", "meeting"],
  ["案内", "あんない", "guidance"], ["紹介", "しょうかい", "introduction"], ["予約", "よやく", "reservation"], ["旅行", "りょこう", "trip"], ["留学", "りゅうがく", "study abroad"], ["研究", "けんきゅう", "research"],
  ["宿題", "しゅくだい", "homework"], ["成績", "せいせき", "grades"], ["卒業", "そつぎょう", "graduation"], ["入学", "にゅうがく", "entering school"], ["試合", "しあい", "match"], ["大切", "たいせつ", "important"],
  ["大変", "たいへん", "tough / serious"], ["有名", "ゆうめい", "famous"], ["便利", "べんり", "convenient"], ["不便", "ふべん", "inconvenient"], ["親切", "しんせつ", "kind"], ["季節", "きせつ", "season"],
  ["自然", "しぜん", "nature"], ["世界", "せかい", "world"], ["地図", "ちず", "map"], ["空港", "くうこう", "airport"], ["病院", "びょういん", "hospital"], ["事故", "じこ", "accident"],
  ["交通", "こうつう", "traffic"], ["工事", "こうじ", "construction"], ["電話", "でんわ", "telephone"], ["図書館", "としょかん", "library"], ["野菜", "やさい", "vegetables"], ["料理", "りょうり", "cooking / dish"],
];
const N3_KANJI: [string, string, string][] = [
  ["影響", "えいきょう", "influence"], ["原因", "げんいん", "cause"], ["結果", "けっか", "result"], ["関係", "かんけい", "relationship"], ["経済", "けいざい", "economy"], ["社会", "しゃかい", "society"],
  ["政治", "せいじ", "politics"], ["環境", "かんきょう", "environment"], ["技術", "ぎじゅつ", "technology"], ["情報", "じょうほう", "information"], ["条件", "じょうけん", "condition"], ["場合", "ばあい", "case / occasion"],
  ["状態", "じょうたい", "state"], ["状況", "じょうきょう", "situation"], ["目的", "もくてき", "purpose"], ["理解", "りかい", "understanding"], ["想像", "そうぞう", "imagination"], ["判断", "はんだん", "judgement"],
  ["比較", "ひかく", "comparison"], ["増加", "ぞうか", "increase"], ["減少", "げんしょう", "decrease"], ["発展", "はってん", "development"], ["発表", "はっぴょう", "announcement"], ["発見", "はっけん", "discovery"],
  ["努力", "どりょく", "effort"], ["成功", "せいこう", "success"], ["失敗", "しっぱい", "failure"], ["責任", "せきにん", "responsibility"], ["習慣", "しゅうかん", "habit / custom"], ["特徴", "とくちょう", "feature"],
  ["機会", "きかい", "opportunity"], ["普通", "ふつう", "ordinary"], ["確認", "かくにん", "confirmation"], ["参加", "さんか", "participation"], ["相談", "そうだん", "consultation"], ["計画", "けいかく", "plan"],
  ["予想", "よそう", "expectation"], ["以外", "いがい", "other than"], ["以上", "いじょう", "more than"], ["以下", "いか", "less than"], ["最近", "さいきん", "recently"], ["将来", "しょうらい", "future"],
  ["現在", "げんざい", "present"], ["過去", "かこ", "past"], ["全体", "ぜんたい", "whole"], ["部分", "ぶぶん", "part"], ["方法", "ほうほう", "method"], ["能力", "のうりょく", "ability"],
];

const plan14 = [
  ["Day 1", "Read the Exam page + Tamil page. Learn particles and the て-form helper table. Do Set 1, lessons #1–2."],
  ["Day 2–3", "Set 1 lessons #3–5 + combined exam. Daily 20 words. 10 kanji combinations (list below)."],
  ["Day 4–5", "Set 2 (て-form helpers) + Set 3. Listen to 2 listening sets (N4)."],
  ["Day 6–7", "Set 4 (ば, のに, passive, causative). Do 2 reading sets (N4). Weekly review: redo every quiz you failed."],
  ["Day 8–9", "Set 15 (そうだ, ようだ, と思う, かどうか, んです). Daily 20 words + 10 kanji combos."],
  ["Day 10–11", "Set 17 + Set 16 (polite requests). Listening: 3 sets. Reading: 2 sets."],
  ["Day 12", "Timed mini-mock: 25 min vocabulary quiz + 1 reading + 1 listening, no help."],
  ["Day 13", "Go through the 'Must-know grammar' list below; redo every quiz under 80%."],
  ["Day 14", "Rest, light review of words you marked 'unknown', early sleep. Check exam-day rules (ID, pencils)."],
];
const plan30 = [
  ["Week 1", "Sets 1–2 (N4) + particles + 20 words/day."],
  ["Week 2", "Sets 3–4 + Set 15. 2 listening + 2 reading sets."],
  ["Week 3", "Sets 7–10 (skills) quickly: only the quizzes and the speaking tests. Kanji combos 10/day."],
  ["Week 4", "Sets 16–17, full revision, 2 timed mock papers (use sample questions from the Exam page), then the exam."],
];

export default function FastTrack() {
  const ex = (ids: string[]) =>
    ids
      .map((id) => getGrammar(id))
      .filter((g): g is NonNullable<ReturnType<typeof getGrammar>> => !!g);
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-rose-500 p-8 text-white shadow">
        <h1 className="text-3xl font-bold">⚡ Pass-first fast track</h1>
        <p className="mt-2 max-w-3xl text-indigo-50">
          Not much time? <b>Priority 1 is passing</b>, priority 2 is speaking. This page lists what gives the most marks: the grammar patterns that repeat every exam, the kanji words you must be able to read,
          a vocabulary method that works, and a short-time study plan.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🎯 The scoring logic (so you study the right things)</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-700">
          <li><b>N4:</b> pass = 90/180 <u>and</u> Language+Reading ≥ 38/120 <u>and</u> Listening ≥ 19/60. Listening is a third of the marks — never skip it.</li>
          <li><b>N3:</b> pass = 95/180 <u>and</u> at least 19/60 in EACH of Vocabulary/Grammar, Reading and Listening. One weak section fails you, so balance all three.</li>
          <li>There is <b>no penalty for wrong answers</b> — answer every question.</li>
          <li>Grammar & vocabulary questions are quick (a few seconds each) — spend the saved time on Reading.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">📝 Learn vocabulary in 5 steps (how to build English meaning fast)</h2>
        <ol className="mt-3 space-y-2 text-slate-700">
          <li className="rounded-xl bg-slate-50 p-3"><b>1 · Meet the word in a sentence.</b> In every lesson tap <b>🔍 Word-by-word English meaning</b> under each sentence, then open <b>📝 Words in this lesson</b> and read the list.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>2 · Attach a hook.</b> On the <Link href="/vocab" className="font-semibold text-rose-700 underline">Words page</Link> each card has a Tamil memory hook. Say the word out loud 3 times with the hook.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>3 · Free words first.</b> Learn <Link href="/tamil-words" className="font-semibold text-rose-700 underline">katakana = English words</Link> (≈ 50 free words) and the sound-alikes — one evening.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>4 · Test yourself the same day</b> with <b>🧪 Test my vocabulary</b> in the lesson, then the quiz/flashcards on the Words page. Mark only the words you truly know as &quot;known&quot;.</li>
          <li className="rounded-xl bg-slate-50 p-3"><b>5 · Repeat on day 1, 3, 7, 14.</b> Use <b>Daily 20</b> — it serves 20 words you have not marked known. 20 words × 30 days = 600 words.</li>
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🧩 Must-know grammar (appears again and again)</h2>
        <p className="text-sm text-slate-500">Tap a pattern to open its lesson (works best in Exam-cram mode on the home page).</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-bold text-rose-700">N4 · top {N4_GRAMMAR.length}</h3>
            <div className="flex flex-wrap gap-1.5">
              {ex(N4_GRAMMAR).map((g) => (
                <Link key={g.id} href={`/grammar/${g.id}`} className="rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-medium text-rose-800 hover:bg-rose-100">{g.title.replace(/\s*\(.*\)$/, "")}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-indigo-700">N3 · top {N3_GRAMMAR.length}</h3>
            <div className="flex flex-wrap gap-1.5">
              {ex(N3_GRAMMAR).map((g) => (
                <Link key={g.id} href={`/grammar/${g.id}`} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-800 hover:bg-indigo-100">{g.title.replace(/\s*\(.*\)$/, "")}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {([["N4", "rose", N4_KANJI], ["N3", "indigo", N3_KANJI]] as const).map(([lv, color, rows]) => (
        <section key={lv} className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">🈳 {lv} kanji words you must be able to read ({rows.length})</h2>
          <p className="text-sm text-slate-500">These compound words appear again and again in vocabulary, reading and notices. Tap one for its Tamil memory hook.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(([k, r, m]) => (
              <Link key={k} href={`/vocab?q=${encodeURIComponent(k)}`} className={`rounded-xl border border-slate-200 px-3 py-2 ${color === "rose" ? "hover:border-rose-300 hover:bg-rose-50" : "hover:border-indigo-300 hover:bg-indigo-50"}`}>
                <span className="text-lg font-bold">{k}</span> <span className="text-sm text-rose-700">{r}</span>
                <div className="text-sm text-slate-600">{m}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">📅 14-day crash plan (N4)</h2>
          <ol className="mt-3 space-y-2">
            {plan14.map(([d, t]) => (
              <li key={d} className="rounded-xl bg-slate-50 p-3 text-sm"><b className="text-rose-700">{d}</b> — {t}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">📅 30-day plan</h2>
          <ol className="mt-3 space-y-2">
            {plan30.map(([d, t]) => (
              <li key={d} className="rounded-xl bg-slate-50 p-3 text-sm"><b className="text-indigo-700">{d}</b> — {t}</li>
            ))}
          </ol>
          <h3 className="mt-5 font-bold">Exam-day tactics</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Do grammar & vocabulary FAST, then use the time on reading.</li>
            <li>In listening, read the answer options during the pause before the audio.</li>
            <li>Never leave a blank — guess.</li>
            <li>Bring your admission card, ID and pencils (HB) — check the official FAQ on the Exam page.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
