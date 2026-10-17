const levels = [
  {
    level: "N4",
    color: "rose",
    summary: "Understand basic Japanese: everyday conversation spoken slowly, simple reading on familiar topics.",
    words: "≈ 1,500 words · ≈ 300 kanji (common estimates)",
    sections: [
      ["言語知識（文字・語彙） Vocabulary", "25 min"],
      ["言語知識（文法）・読解 Grammar & Reading", "55 min"],
      ["聴解 Listening", "35 min"],
    ],
    scoring: [
      ["Language Knowledge (Vocab/Grammar) + Reading", "0–120", "min 38"],
      ["Listening", "0–60", "min 19"],
    ],
    pass: "Overall pass: 90 / 180 (and every sectional minimum)",
  },
  {
    level: "N3",
    color: "indigo",
    summary: "Understand everyday Japanese to a certain degree: newspaper headlines, slightly difficult text, natural-speed conversation.",
    words: "≈ 3,700 words · ≈ 650 kanji (common estimates)",
    sections: [
      ["言語知識（文字・語彙） Vocabulary", "30 min"],
      ["言語知識（文法）・読解 Grammar & Reading", "70 min"],
      ["聴解 Listening", "40 min"],
    ],
    scoring: [
      ["Language Knowledge (Vocab/Grammar)", "0–60", "min 19"],
      ["Reading", "0–60", "min 19"],
      ["Listening", "0–60", "min 19"],
    ],
    pass: "Overall pass: 95 / 180 (and every sectional minimum)",
  },
];

const questionTypes = [
  ["文字・語彙 Vocabulary", ["漢字読み — read the kanji", "表記 — choose the correct kanji", "文脈規定 — fill the right word in context", "言い換え類義 — choose the synonym", "用法 — choose the sentence using the word correctly"]],
  ["文法 Grammar", ["文法形式の判断 — choose the correct grammar form", "文の組み立て — put 4 pieces in order, answer the ★ position", "文章の文法 — grammar in a short passage"]],
  ["読解 Reading", ["内容理解（短文・中文）— short & medium passages", "長文 — long passage (N3)", "情報検索 — find info in ads/notices/timetables"]],
  ["聴解 Listening", ["課題理解 — what will the person do next?", "ポイント理解 — catch the key point/reason", "概要理解 — overall gist (N3)", "発話表現 — what do you say in this situation?", "即時応答 — choose the quick natural reply"]],
] as const;

// Every link below was opened and returned a live page when this app was built.
const official = [
  ["JLPT official site (English)", "https://www.jlpt.jp/e/", "Registration news, dates, rules"],
  ["Level summary N1–N5", "https://www.jlpt.jp/e/about/levelsummary.html", "What 'can-do' each level means"],
  ["Test sections & times", "https://www.jlpt.jp/e/guideline/testsections.html", "Minutes per section for every level"],
  ["Scoring, pass/fail & score report", "https://www.jlpt.jp/e/guideline/results.html", "How the 180 points and sectional minimums work"],
  ["Official sample questions & practice workbooks", "https://www.jlpt.jp/e/samples/forlearners.html", "Free sample papers + info on the Official Practice Workbook"],
  ["Sample question index", "https://www.jlpt.jp/e/samples/sampleindex.html", "All sample question files"],
  ["Test sites outside Japan", "https://www.jlpt.jp/e/application/overseas_list.html", "Official list of centres and organisers (India listed below)"],
  ["JLPT FAQ", "https://www.jlpt.jp/e/faq/index.html", "Rules, IDs, what to bring"],
  ["Japan Foundation", "https://www.jpf.go.jp/e/", "Organiser of the JLPT outside Japan"],
] as const;

const practise = [
  ["NHK News Web Easy", "https://www3.nhk.or.jp/news/easy/", "Daily news in easy Japanese with furigana — best free reading/listening practice"],
  ["NHK WORLD: Easy Japanese", "https://www.nhk.or.jp/lesson/en/", "Free audio lessons and dialogues (English)"],
  ["Irodori (Japan Foundation)", "https://www.irodori.jpf.go.jp/en/", "Free everyday-Japanese course with audio"],
  ["JLPT Sensei", "https://jlptsensei.com/", "Free N4/N3 grammar, vocabulary and kanji lists with examples"],
  ["Bunpro", "https://bunpro.jp/", "Grammar drills organised by JLPT level (free tier + paid)"],
  ["Tae Kim's Guide to Japanese", "https://guidetojapanese.org/learn/", "Free grammar explanations"],
  ["Imabi", "https://imabi.org/", "Deep free grammar reference (use for N3 nuance)"],
  ["WaniKani", "https://www.wanikani.com/", "Kanji + vocabulary with spaced repetition (free levels 1–3)"],
  ["AnkiWeb shared decks (JLPT N3)", "https://ankiweb.net/shared/decks?search=jlpt+n3", "Download ready-made vocabulary decks"],
  ["Jisho dictionary", "https://jisho.org/", "Look up words, kanji and example sentences"],
] as const;

const indiaCentres = [
  ["New Delhi", "Mombusho Scholars Association of India (MOSAI)"],
  ["Pune", "Japanese Language Teachers' Association, Pune (JALTAP)"],
  ["Mumbai", "Japanese Language Teachers' Association, Pune (JALTAP)"],
  ["Kolkata", "The Indo-Japan Welfare and Cultural Association"],
  ["Chennai", "ABK-AOTS DOSOKAI, Tamilnadu Centre"],
  ["Bengaluru", "Bangalore Nihongo Kyooshi-kai (BNK)"],
  ["Karur", "Japanese Language Teachers Association"],
  ["Santiniketan", "Visva-Bharati"],
] as const;

const books = [
  ["日本語能力試験 公式問題集 (Official Practice Workbook)", "Real past-style papers made with the exam organisers — the closest thing to genuine exam papers."],
  ["新完全マスター (Shin Kanzen Master) N4 / N3", "Separate books for grammar, vocabulary, kanji, reading, listening — the standard for serious preparation."],
  ["日本語総まとめ (Nihongo So-matome) N3 / N4", "Week-by-week plan with daily tests — good if you have limited time."],
  ["Try! (N3 / N4)", "Grammar book with English notes — friendly for self-study."],
  ["合格できる (Goukaku dekiru) mock tests", "Practice-exam sets for timing and listening practice."],
  ["Genki I & II / Tobira", "Textbooks that cover the grammar behind N5–N3; Genki for N4, Tobira for N3."],
];

const plan = [
  ["Weeks 1–2", "Hiragana/Katakana perfect + N5 review. Learn the particle table on the Tamil page by heart."],
  ["Weeks 3–8", "Sets 1–4 and 7–10 (N4). 15–20 new words + 5 kanji daily. Do every speaking test out loud."],
  ["Weeks 9–12", "Sets 15–17 (N4 Plus) + N4 mock tests. Listening 20 min/day. Take N4."],
  ["Months 4–6", "Sets 5, 6, 11–14 (N3). Vocabulary rises to 25 words/day. Read NHK News Web Easy daily."],
  ["Months 7–8", "Sets 18–20 (N3 Plus). N3 sample/workbook papers under timed conditions. Shadowing listening. Take N3."],
];

const methods = [
  ["🎤 Speak every sentence", "Grammar sticks when you produce it. Use this site's speaking tests — saying a pattern 10× beats reading it 50×."],
  ["🪷 Translate from Tamil, not English", "Tamil word order = Japanese word order. Build the Tamil sentence in your head, then swap each piece."],
  ["🔁 Spaced repetition (SRS)", "Review vocab after 1, 3, 7, 14, 30 days. Use the flashcards here or Anki."],
  ["🎧 Shadowing", "Play a short audio line, pause, repeat it with the same rhythm. Huge for 聴解."],
  ["⏱ Timed mock tests", "Reading time is tight. Practise with a timer from month 2. Answer every question — the JLPT has no penalty for wrong answers."],
  ["✍️ Kanji by components", "Learn radicals (氵water, 亻person, 言 speech). 話・語・読 all have 言 → 'speech' words."],
  ["📰 Daily input", "NHK News Web Easy, Japanese YouTube with Japanese subtitles, anime with Japanese subtitles."],
];

export default function ExamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🎯 JLPT N4 & N3 — Exam guide</h1>
        <p className="mt-1 text-slate-600">What&apos;s tested, how it&apos;s scored, real links, and a study plan designed for Tamil speakers. Times and scoring were checked against the official JLPT site.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((l) => (
          <section key={l.level} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`rounded-xl px-3 py-1 text-2xl font-bold text-white ${l.color === "rose" ? "bg-rose-600" : "bg-indigo-600"}`}>{l.level}</span>
              <span className="text-sm text-slate-500">{l.words}</span>
            </div>
            <p className="mt-3 text-slate-700">{l.summary}</p>
            <h3 className="mt-4 font-semibold">Sections</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {l.sections.map(([s, t]) => (
                <li key={s} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{s}</span>
                  <span className="font-semibold">{t}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Scoring</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {l.scoring.map(([s, r, m]) => (
                <li key={s} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{s}</span>
                  <span className="whitespace-nowrap">
                    {r} · <b>{m}</b>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{l.pass}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🔗 Official links (checked live)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {official.map(([t, u, d]) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-3 hover:border-rose-300 hover:bg-rose-50">
              <div className="font-semibold text-rose-700 underline">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">📄 Past papers — what really exists</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-700">
          <li>
            The JLPT <b>does not publish full past exam papers for free</b>. What is official and free: the <b>sample questions</b> (link above) for every level, with audio for listening.
          </li>
          <li>
            The closest real thing is the <b>Official Practice Workbook (公式問題集)</b> for each level — paid books made with the exam organisers. Buy N4 and N3 and do them timed.
          </li>
          <li>Be careful with websites that claim to sell &quot;real past papers&quot; — they are usually unofficial mock tests. Mocks are fine for practice, just don&apos;t expect identical questions.</li>
        </ul>
        <h3 className="mt-4 font-semibold">Books worth buying</h3>
        <ul className="mt-2 space-y-2">
          {books.map(([t, d]) => (
            <li key={t} className="rounded-xl bg-slate-50 p-3">
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🌐 Free practice sites (checked live)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {practise.map(([t, u, d]) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50">
              <div className="font-semibold text-indigo-700 underline">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">Word meanings inside this app come from JMdict (© EDRDG, CC BY-SA 4.0).</p>
      </section>

      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-bold">📍 Taking the JLPT in India — including Tamil Nadu</h2>
        <p className="mt-1 text-sm text-amber-900">
          The exam is held twice a year (July and December). These centres are listed on the <b>official overseas test-site list</b> at the time this app was built — always confirm dates, fees and
          the application window on the{" "}
          <a className="font-semibold underline" href="https://www.jlpt.jp/e/application/overseas_list.html" target="_blank" rel="noreferrer">
            official page
          </a>
          .
        </p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {indiaCentres.map(([city, org]) => (
            <li key={city + org} className={`rounded-xl bg-white p-3 ${city === "Chennai" || city === "Karur" ? "ring-2 ring-amber-400" : ""}`}>
              <div className="font-bold">
                {city} {(city === "Chennai" || city === "Karur") && <span className="text-xs font-semibold text-amber-700">· Tamil Nadu</span>}
              </div>
              <div className="text-sm text-slate-600">{org}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Question types (問題)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {questionTypes.map(([title, items]) => (
            <div key={title} className="rounded-xl bg-slate-50 p-4">
              <div className="font-bold text-rose-700">{title}</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">📅 Fresher → N4 → N3 plan (~8 months, 1.5–2 h/day)</h2>
        <ol className="mt-3 space-y-2">
          {plan.map(([w, d]) => (
            <li key={w} className="grid gap-1 rounded-xl bg-slate-50 p-3 md:grid-cols-[140px_1fr]">
              <span className="font-bold text-indigo-700">{w}</span>
              <span className="text-slate-700">{d}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-slate-500">Short on time? Use the ⚡ Pass-first fast track page — it has a 14-day and a 30-day plan.</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🧠 Methods that work</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {methods.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-100 p-4">
              <div className="font-bold">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-400">Timings and scoring follow the official JLPT site (jlpt.jp). Word/kanji counts are common estimates — the official test no longer publishes vocabulary lists.</p>
    </div>
  );
}
