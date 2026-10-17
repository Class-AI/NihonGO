import type { Level } from "@/lib/types";
import { rowsN4a } from "./vocab-n4a";
import { rowsN4b } from "./vocab-n4b";
import { rowsN3a } from "./vocab-n3a";
import { rowsN3b } from "./vocab-n3b";

export interface Vocab {
  id: string;
  level: Level;
  cat: string;
  kanji: string;
  reading: string;
  en: string;
  ta: string; // Tamil meaning (script + romanization)
  hook: string; // memory trick for Tamil speakers
}

type Row = [string, string, string, string, string, string];

const n4: Row[] = [
  // People & family
  ["family", "家族", "かぞく", "family", "குடும்பம் (kudumbam)", "'Ka-zoku' — the 'kootam' (crowd) at home: your family!"],
  ["family", "兄", "あに", "my elder brother", "அண்ணன் (aṇṇan)", "a-NI ≈ a-NNA. Old Niigata dialect even says 'annya' for brother!"],
  ["family", "姉", "あね", "my elder sister", "அக்கா (akkaa)", "a-NE — 'anne' in old dialects; think அண்ணி (aṇṇi)."],
  ["family", "祖母", "そぼ", "my grandmother", "பாட்டி (paatti)", "SO-BO: Paatti says 'so-bo(r)ing' stories."],
  ["family", "息子", "むすこ", "son", "மகன் (magan)", "MUSU-ko — a son with a muscle (muscu)."],
  ["family", "娘", "むすめ", "daughter", "மகள் (magal)", "MUSU-ME: 'my sweet' daughter."],
  ["people", "医者", "いしゃ", "doctor", "மருத்துவர் (maruththuvar)", "I-SHA → 'ishaa' — ask the doctor 'enna ishaa?'"],
  ["people", "店員", "てんいん", "shop clerk", "கடை ஊழியர்", "TEN-IN: ten people in the shop."],
  // Places
  ["places", "病院", "びょういん", "hospital", "மருத்துவமனை (maruththuvamanai)", "BYOU-IN: 病 = sick → 'byo' sounds like 'vyaadhi' (disease)."],
  ["places", "図書館", "としょかん", "library", "நூலகம் (noolagam)", "TO-SHO-KAN: 'to show' books in a 'kaanakam'."],
  ["places", "空港", "くうこう", "airport", "விமான நிலையம்", "KUU-KOU: 'koo-koo' — plane noise!"],
  ["places", "寺", "てら", "temple", "கோயில் (kōyil)", "TERA ≈ தேர் (thēr) — the temple chariot!"],
  ["places", "町", "まち", "town", "ஊர் / நகரம்", "MACHI ≈ மச்சி (machi) — your town friends!"],
  ["places", "工場", "こうじょう", "factory", "தொழிற்சாலை", "KOU-JOU: big factory = 'kojo' work."],
  // Nature
  ["nature", "山", "やま", "mountain", "மலை (malai)", "YAMA = எமன் (Yaman) lives on a mountain top."],
  ["nature", "川", "かわ", "river", "ஆறு (aaru)", "KAWA: Kaveri river → 'Ka-wa'."],
  ["nature", "海", "うみ", "sea", "கடல் (kadal)", "UMI: 'oomai' (silent) deep sea."],
  ["nature", "空", "そら", "sky", "வானம் (vaanam)", "SORA: look 'sora-ah' up at the sky."],
  ["nature", "雪", "ゆき", "snow", "பனி (pani)", "YUKI: 'yuk-ee' cold snow!"],
  ["nature", "風", "かぜ", "wind / (風邪) cold", "காற்று (kaatru)", "KAZE ≈ காற்று (kaatru) — both start with 'ka'."],
  // Food
  ["food", "米", "こめ", "uncooked rice", "அரிசி (arisi)", "KOME: 'come' eat rice."],
  ["food", "野菜", "やさい", "vegetables", "காய்கறி (kaaykari)", "YA-SAI: 'yes, sai(d)' amma — eat vegetables."],
  ["food", "肉", "にく", "meat", "இறைச்சி (iraichchi)", "NIKU: 'nik-ku' — chicken-ku!"],
  ["food", "味", "あじ", "taste", "சுவை (suvai)", "AJI ≈ அறுசுவை (aru-suvai) — six tastes."],
  ["food", "辛い", "からい", "spicy", "காரம் (kaaram)", "KARAI ≈ காரம் (kaaram)! Nearly the same sound and meaning."],
  ["food", "甘い", "あまい", "sweet", "இனிப்பு (inippu)", "AMAI: 'amma-i' — amma's sweets."],
  // Verbs
  ["verbs", "話す", "はなす", "to speak", "பேசு (pēsu)", "HANA-SU: Ohno linked it to Tamil; think 'haa-naa' talk."],
  ["verbs", "聞く", "きく", "to listen / ask", "கேள் (kēḷ)", "KIKU ≈ கேக்கு (kēkku) — 'kēḷu'! Even 'medicine works' = 薬が効く = 'marundhu kēkkum'."],
  ["verbs", "見る", "みる", "to see", "பார் (paar)", "MIRU: 'mirror' — you see in it. 〜てみる = 〜ப் பார்!"],
  ["verbs", "置く", "おく", "to put / keep", "வை (vai)", "OKU: 'ok, keep it'. 〜ておく = 〜வை (vaangi vai)."],
  ["verbs", "急ぐ", "いそぐ", "to hurry", "அவசரப்படு", "ISOGU: 'I so go' quickly!"],
  ["verbs", "手伝う", "てつだう", "to help", "உதவு (udhavu)", "TE-TSU-DAU: 手 (te) = hand — lend a hand."],
  ["verbs", "忘れる", "わすれる", "to forget", "மற (mara)", "WASURERU: 'was surely' forgotten."],
  ["verbs", "覚える", "おぼえる", "to memorize", "நினைவில் வை", "OBOERU: 'o-boy-eru' — memorize!"],
  ["verbs", "運ぶ", "はこぶ", "to carry", "தூக்கிச் செல்", "HAKOBU: 箱 (hako, box) — carry a box."],
  ["verbs", "集める", "あつめる", "to collect", "சேர் (sēr)", "ATSUMERU: 'a sum' — collect a sum."],
  ["verbs", "壊れる", "こわれる", "to break (itself)", "உடை (udai)", "KOWARERU: 'ko-wah!' it broke."],
  ["verbs", "褒める", "ほめる", "to praise", "பாராட்டு (paaraattu)", "HOMERU: Homer gets praised."],
  ["verbs", "叱る", "しかる", "to scold", "திட்டு (thittu)", "SHIKARU: 'shikari' hunter scolds."],
  // Adjectives
  ["adjectives", "暗い", "くらい", "dark", "இருட்டு (iruttu)", "KURAI ≈ குறை (kurai, less) — less light = dark."],
  ["adjectives", "怖い", "こわい", "scary", "பயமா (bayamaa)", "KOWAI: 'ko-why?' — scary!"],
  ["adjectives", "眠い", "ねむい", "sleepy", "தூக்கமா (thookkamaa)", "NEMUI: 'neem' tree shade → sleepy."],
  ["adjectives", "珍しい", "めずらしい", "rare", "அபூர்வம் (apoorvam)", "MEZURASHII: rare like a 'mezhugu' (wax) statue."],
  ["adjectives", "親切", "しんせつ", "kind", "அன்பான", "SHINSETSU: kind 'sincere' person."],
  ["adjectives", "大切", "たいせつ", "important / precious", "முக்கியம் (mukkiyam)", "TAISETSU: 'tie set' — precious."],
  // Time
  ["time", "将来", "しょうらい", "future", "எதிர்காலம் (edhirkaalam)", "SHOURAI: 'show-rai' your future."],
  ["time", "昔", "むかし", "long ago", "பழங்காலம் (pazhangaalam)", "MUKASHI: 'mun kaalam' (முன் காலம்) — mu…ka!"],
  ["time", "最近", "さいきん", "recently", "சமீபத்தில் (sameebaththil)", "SAIKIN: 'psych-in' recently."],
  ["time", "途中", "とちゅう", "on the way", "வழியில் (vazhiyil)", "TOCHUU: 'touch-ūū' on the way."],
  // Particles & Tamil bridge
  ["particles", "〜か", "か", "question marker", "-ஆ (-aa)", "சாப்டீங்களா? (saapteengal-aa?) = 食べましたか? Question marker at the very end, just like Tamil."],
  ["particles", "〜も", "も", "also / too", "-உம் (-um)", "நானும் (naan-um) = 私も (watashi mo)."],
  ["particles", "〜を", "を", "object marker", "-ஐ (-ai)", "சாதத்தை (saadhaththai) = ご飯を."],
  ["particles", "〜に", "に", "to / at (time, target)", "-க்கு (-kku)", "ஸ்கூலுக்கு (school-ukku) = 学校に."],
  ["particles", "〜で", "で", "at (place of action) / by", "-இல் / -ஆல்", "பஸ்ஸில் (bus-il) = バスで."],
  ["particles", "〜の", "の", "possessive 's", "-உடைய / -ஓட (-ōda)", "என்னோட (ennōda) = 私の."],
  ["particles", "〜から", "から", "from / because", "-இலிருந்து / -ஆல", "வீட்டிலிருந்து = 家から."],
  ["particles", "〜まで", "まで", "until", "-வரை (-varai)", "ஐந்து மணி வரை = 五時まで."],
];

const n3: Row[] = [
  ["work", "会議", "かいぎ", "meeting", "கூட்டம் (koottam)", "KAIGI: 'kai' (hand) raised in meeting."],
  ["work", "経験", "けいけん", "experience", "அனுபவம் (anubavam)", "KEIKEN: 'cake-en' baking experience."],
  ["work", "給料", "きゅうりょう", "salary", "சம்பளம் (sambalam)", "KYUURYOU: queue for salary."],
  ["work", "転勤", "てんきん", "job transfer", "பணி மாற்றம் (maaththal)", "TENKIN: 'ten kin' miles transfer."],
  ["work", "締め切り", "しめきり", "deadline", "கடைசி தேதி", "SHIMEKIRI: 'shimmy-cut' — cut off!"],
  ["work", "責任", "せきにん", "responsibility", "பொறுப்பு (poruppu)", "SEKININ: 'seek-in' responsibility."],
  ["society", "環境", "かんきょう", "environment", "சுற்றுச்சூழல்", "KANKYOU: 'can-kyo' save environment."],
  ["society", "経済", "けいざい", "economy", "பொருளாதாரம்", "KEIZAI: 'k-sai' economy."],
  ["society", "政治", "せいじ", "politics", "அரசியல் (arasiyal)", "SEIJI: 'say-ji' — politicians say a lot."],
  ["society", "交通", "こうつう", "traffic / transport", "போக்குவரத்து", "KOUTSUU: 'coat-soo' crowded traffic."],
  ["society", "事故", "じこ", "accident", "விபத்து (vibaththu)", "JIKO: 'zig-zag' → accident."],
  ["society", "税金", "ぜいきん", "tax", "வரி (vari)", "ZEIKIN: 'pay king' tax."],
  ["feelings", "緊張", "きんちょう", "nervousness", "பதற்றம் (padhattram)", "KINCHOU: 'kin-chow' nervous before exam."],
  ["feelings", "心配", "しんぱい", "worry", "கவலை (kavalai)", "SHINPAI: shin pain → worry."],
  ["feelings", "安心", "あんしん", "relief", "நிம்மதி (nimmadhi)", "ANSHIN: 'an-shin' — calm heart (心)."],
  ["feelings", "感謝", "かんしゃ", "gratitude", "நன்றி (nandri)", "KANSHA: 'kaan-sha' thank you."],
  ["feelings", "我慢", "がまん", "endurance / patience", "பொறுமை (porumai)", "GAMAN: 'gamanam' (கவனம்) + patience."],
  ["feelings", "恥ずかしい", "はずかしい", "embarrassed", "வெட்கம் (vetkam)", "HAZUKASHII: hazy cheeks — blushing."],
  ["verbs", "比べる", "くらべる", "to compare", "ஒப்பிடு (oppidu)", "KURABERU: 'club-eru' compare clubs."],
  ["verbs", "増える", "ふえる", "to increase", "அதிகரி (adhigari)", "FUERU: fuel increases."],
  ["verbs", "減る", "へる", "to decrease", "குறை (kurai)", "HERU: 'hair' decreasing!"],
  ["verbs", "伝える", "つたえる", "to convey", "சொல்லு / தெரிவி", "TSUTAERU: 'tell-er'."],
  ["verbs", "続ける", "つづける", "to continue", "தொடர் (thodar)", "TSUZUKERU ≈ தொடர் (thodar) — t…d!"],
  ["verbs", "選ぶ", "えらぶ", "to choose", "தேர்ந்தெடு", "ERABU: 'e-rab' choose."],
  ["verbs", "守る", "まもる", "to protect / keep (rules)", "காப்பாற்று", "MAMORU: 'mama' protects."],
  ["verbs", "諦める", "あきらめる", "to give up", "கைவிடு (kaividu)", "AKIRAMERU: 'aiyo, ki-ra-meru' — give up? Never!"],
  ["verbs", "間に合う", "まにあう", "to be in time", "நேரத்துக்கு வா", "MANI-AU: மணி (maṇi, time/hour) + 合う (match) — 'match the maṇi'!"],
  ["verbs", "片付ける", "かたづける", "to tidy up", "ஒழுங்குபடுத்து", "KATAZUKERU: 'cut-a-zook' clean up."],
  ["adjectives", "厳しい", "きびしい", "strict", "கண்டிப்பான (kaṇdippaana)", "KIBISHII: 'key-bishy' strict teacher."],
  ["adjectives", "詳しい", "くわしい", "detailed", "விரிவான", "KUWASHII: detailed 'kuwashi'."],
  ["adjectives", "正直", "しょうじき", "honest", "நேர்மை (nērmai)", "SHOUJIKI: 'show-jiki' honest."],
  ["adjectives", "複雑", "ふくざつ", "complicated", "சிக்கலான (sikkalaana)", "FUKUZATSU: confusing!"],
  ["adjectives", "適当", "てきとう", "suitable / careless", "பொருத்தமான", "TEKITOU: 'take it to' whatever."],
  ["adverbs", "必ず", "かならず", "without fail", "கண்டிப்பா (kaṇdippaa)", "KANARAZU: 'kanda-ra' — kaṇdippaa!"],
  ["adverbs", "たまに", "たまに", "occasionally", "எப்போதாவது", "TAMANI: 'thaa-mani' sometimes."],
  ["adverbs", "やっと", "やっと", "finally", "கடைசியா (kadaisiyaa)", "YATTO: 'yaa! to' finally!"],
  ["adverbs", "ぜひ", "ぜひ", "by all means", "கட்டாயம் (kattaayam)", "ZEHI: 'say hi' by all means."],
  ["adverbs", "なかなか", "なかなか", "quite / not easily", "எளிதா இல்லை", "NAKANAKA: 'naa-ka-naa-ka' not easily."],
  ["adverbs", "ちょうど", "ちょうど", "exactly / just", "சரியா (sariyaa)", "CHOUDO: 'chow-do' exactly now."],
];

function build(rows: Row[], level: Level): Vocab[] {
  const seen = new Set<string>(); // dedupe guard
  const out: Vocab[] = [];
  let i = 0;
  for (const [cat, kanji, reading, en, ta, hook] of rows) {
    const key = `${kanji}@@${reading}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `${level.toLowerCase()}-${i++}`, level, cat, kanji, reading, en, ta, hook });
  }
  return out;
}

const allN4: Row[] = [...n4, ...rowsN4a, ...rowsN4b];
const allN3: Row[] = [...n3, ...rowsN3a, ...rowsN3b];

export const vocab: Vocab[] = [...build(allN4, "N4"), ...build(allN3, "N3")];

export const vocabStats = {
  n4: build(allN4, "N4").length,
  n3: build(allN3, "N3").length,
  total: build(allN4, "N4").length + build(allN3, "N3").length,
};
