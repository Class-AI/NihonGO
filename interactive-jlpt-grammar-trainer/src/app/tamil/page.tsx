import Link from "next/link";

const particles = [
  ["は (wa)", "topic: 'as for…'", "-ஆ / -னா (naan-naa…)", "私は学生です", "நான் மாணவன்"],
  ["が (ga)", "subject (new info)", "(no suffix — nominative)", "雨が降る", "மழை பெய்யுது"],
  ["を (o)", "direct object", "-ஐ (-ai)", "ご飯を食べる", "சாதத்தை சாப்பிடு"],
  ["に (ni)", "to / at (time) / for", "-க்கு (-kku)", "学校に行く", "ஸ்கூலுக்கு போ"],
  ["で (de)", "at (action place) / by means", "-இல் (-il) / -ஆல் (-aal)", "バスで行く", "பஸ்ஸில் போ"],
  ["の (no)", "possessive 's", "-உடைய / -ஓட (-ōda)", "私の本", "என்னோட புத்தகம்"],
  ["と (to)", "with / and", "-ஓடு (-ōdu) / -உம்", "友達と行く", "நண்பனோடு போ"],
  ["も (mo)", "also / too", "-உம் (-um)", "私も行く", "நானும் போறேன்"],
  ["から (kara)", "from / because", "-இலிருந்து / -ஆல", "家から来た", "வீட்டிலிருந்து வந்தேன்"],
  ["まで (made)", "until / up to", "-வரை (-varai)", "五時まで", "ஐந்து மணி வரை"],
  ["か (ka)", "question marker (end)", "-ஆ (-aa)", "食べましたか", "சாப்டீங்களா?"],
  ["ね (ne)", "isn't it? (agreement)", "-ல்ல / இல்லையா", "暑いですね", "வெயிலா இருக்குல்ல"],
  ["と (quote)", "that… (quoting)", "-ன்னு (-nnu)", "行くと言った", "போறேன்னு சொன்னான்"],
];

const helpers = [
  ["〜てみる", "try doing", "-ப் பார் (paar)", "食べてみる", "சாப்பிட்டுப் பார்", "See"],
  ["〜ておく", "do in advance", "-வை (vai)", "買っておく", "வாங்கி வை", "Keep / put"],
  ["〜てしまう", "finish / oops", "-விடு (vidu)", "忘れてしまった", "மறந்துட்டேன்", "Let go"],
  ["〜てあげる・くれる", "do for someone", "-க் கொடு (kodu)", "教えてあげる", "சொல்லிக் கொடு", "Give"],
  ["〜てくる", "go and come back", "-ட்டு வா (vaa)", "行ってきます", "போயிட்டு வரேன்", "Come"],
  ["〜ている", "is doing / state", "-க்கிட்டு இரு (iru)", "食べている", "சாப்பிட்டுக்கிட்டு இருக்கேன்", "Be"],
  ["〜ていく", "go on doing", "-ட்டுப் போ (pō)", "持っていく", "எடுத்துட்டுப் போ", "Go"],
];

const pairs = [
  ["する (suru) — do", "பண்ணு (paṇṇu)", "勉強する = படிப்பு பண்ணு; 電話する = phone பண்ணு — Tamil also adds 'paṇṇu' to nouns/English words exactly like する!"],
  ["なる (naru) — become", "ஆகு (aagu)", "医者になる = டாக்டர் ஆகு. 〜ことになる = ...ன்னு ஆயிடுச்சு."],
  ["ある / いる — exist", "இரு / உண்டு (iru / uṇḍu)", "行ったことがある = போனது உண்டு. ない = இல்லை."],
  ["できる — can", "முடியும் (mudiyum)", "泳ぐことができる = நீந்த முடியும்."],
  ["〜なければならない — must", "-ணும் / வேண்டும்", "行かなければならない = போகணும்."],
  ["〜てもいい — may", "-லாம் (-laam)", "座ってもいいですか = உட்காரலாமா?"],
  ["〜てはいけない — must not", "-கூடாது (koodaadhu)", "吸ってはいけない = புகைக்கக் கூடாது."],
  ["〜らしい — I heard", "-ஆம் (-aam)", "雨らしい = மழை வருமாம்."],
];

export default function TamilPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-amber-500 to-rose-500 p-8 text-white shadow">
        <h1 className="text-3xl font-bold">🪷 Think in Tamil, speak in Japanese</h1>
        <p className="mt-2 max-w-3xl text-amber-50">
          Tamil and Japanese are unrelated by script, but their <b>sentence structure is amazingly similar</b>: both are Subject-Object-Verb, both use
          suffixes/particles after nouns, both glue helpers onto verbs, and both have a respect system. Linguist Susumu Ohno even proposed a historical link (that&apos;s
          debated) — but for <i>learning</i>, the structural match is a huge advantage that English speakers don&apos;t have.
        </p>
      </section>

      <Link href="/tamil-words" className="block rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 hover:bg-amber-100">
        <div className="font-bold text-amber-900">🔤 New: Tamil ↔ Japanese look-alike words →</div>
        <div className="text-sm text-amber-800">Real shared words (curry, mango, Sanskrit words), katakana = English, and sound-alike memory tricks — with a quiz.</div>
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">1. Same word order (SOV)</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">ENGLISH (S-V-O)</div>
            <div className="text-lg">I <b>eat</b> rice at home.</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <div className="text-xs font-semibold text-amber-600">TAMIL (S-O-V)</div>
            <div className="text-lg">நான் வீட்டில் சாதம் <b>சாப்பிடுகிறேன்</b></div>
            <div className="text-sm text-slate-500">naan veettil saadham saappidugiren</div>
          </div>
          <div className="rounded-xl bg-rose-50 p-4">
            <div className="text-xs font-semibold text-rose-600">JAPANESE (S-O-V)</div>
            <div className="text-lg">私は家でご飯を<b>食べます</b></div>
            <div className="text-sm text-slate-500">わたしは いえで ごはんを たべます</div>
          </div>
        </div>
        <p className="mt-3 text-slate-700">
          👉 Word-by-word: நான்=私は · வீட்டில்=家で · சாதம்(-ஐ)=ご飯を · சாப்பிடுகிறேன்=食べます. <b>Translate from Tamil, not from English!</b>
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">2. Particles = Tamil case suffixes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-2">Particle</th>
                <th className="p-2">Job</th>
                <th className="p-2">Tamil equivalent</th>
                <th className="p-2">日本語</th>
                <th className="p-2">தமிழ்</th>
              </tr>
            </thead>
            <tbody>
              {particles.map((r) => (
                <tr key={r[0] + r[1]} className="border-t border-slate-100">
                  <td className="p-2 text-lg font-bold text-rose-700">{r[0]}</td>
                  <td className="p-2">{r[1]}</td>
                  <td className="p-2 font-medium text-amber-800">{r[2]}</td>
                  <td className="p-2">{r[3]}</td>
                  <td className="p-2">{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">3. Te-form helpers = Tamil verb + helper verb (your superpower!)</h2>
        <p className="mt-1 text-slate-600">Japanese て-form + helper works exactly like Tamil வினையெச்சம் (-ட்டு / -இ) + helper verb.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {helpers.map((h) => (
            <div key={h[0]} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-rose-700">{h[0]}</span>
                <span className="text-sm text-slate-500">{h[1]}</span>
              </div>
              <div className="mt-1 text-amber-900">
                = Tamil <b>{h[2]}</b> (&quot;{h[5]}&quot;)
              </div>
              <div className="mt-1 text-sm">
                {h[3]} ⇄ {h[4]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">4. Grammar endings you already know</h2>
        <div className="mt-3 space-y-2">
          {pairs.map((p) => (
            <div key={p[0]} className="grid gap-1 rounded-xl bg-slate-50 p-3 md:grid-cols-[220px_200px_1fr]">
              <div className="font-bold text-rose-700">{p[0]}</div>
              <div className="font-medium text-amber-800">{p[1]}</div>
              <div className="text-sm text-slate-700">{p[2]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">5. Pronunciation tips for Tamil speakers</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
          <li>Japanese has only 5 vowels (あいうえお) — Tamil has them all. Keep them short and pure; long vowels (おう, えい, ー) are held for 2 beats like Tamil நெடில் (ஆ, ஈ, ஊ).</li>
          <li>っ (small tsu) = doubled consonant, just like Tamil க்க / ட்ட / ப்ப: 切手 kitte ≈ &quot;kit-te&quot; like பட்டம்.</li>
          <li>ら行 (r) is a light tap, very close to Tamil ர (not ற).</li>
          <li>ふ is softer than Tamil ப — blow air gently. つ = &quot;ts&quot;.</li>
          <li>ん before p/b/m sounds like ம்: さんぽ = sampo. Before k/g it&apos;s like ங்: ぎんこう ≈ ging-kō.</li>
          <li>No retroflex sounds (ட, ள, ண) in Japanese — keep the tongue relaxed and forward.</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">6. Respect language (敬語) ≈ Tamil நீ / நீங்க</h2>
        <p className="mt-2 text-slate-700">
          Tamil changes verb endings for respect: சாப்பிடு → சாப்பிடுங்க → சாப்பிடுங்கள். Japanese does the same: 食べる → 食べます → 召し上がる (honorific) / いただく (humble).
          For N4 you need ます/です and basic いらっしゃる・おっしゃる・いただく; for N3, recognise the main honorific/humble verbs.
        </p>
      </section>

      <div className="text-center">
        <Link href="/" className="rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white">
          Start the grammar path →
        </Link>
      </div>
    </div>
  );
}
