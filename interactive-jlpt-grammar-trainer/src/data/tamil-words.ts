// Tamil ↔ Japanese word links. EVERY entry is labelled with how reliable the link is:
//  real  = genuinely shared history (loanwords) — safe to trust
//  eng   = English words Tamil speakers already use (Japanese writes them in katakana)
//  trick = sound-alike only — a memory trick, NOT a claim that the words are related
export type Tier = "real" | "eng" | "trick";

export interface TamilWord {
  jp: string;
  reading: string;
  en: string;
  ta: string; // Tamil script
  tr: string; // Tamil transliteration
  tier: Tier;
  note: string;
}

const r = (jp: string, reading: string, en: string, ta: string, tr: string, note: string): TamilWord => ({ jp, reading, en, ta, tr, tier: "real", note });
const e = (jp: string, reading: string, en: string, ta: string, tr: string, note = "same English word"): TamilWord => ({ jp, reading, en, ta, tr, tier: "eng", note });
const t = (jp: string, reading: string, en: string, ta: string, tr: string, note: string): TamilWord => ({ jp, reading, en, ta, tr, tier: "trick", note });

export const TIERS: Record<Tier, { label: string; icon: string; blurb: string }> = {
  real: { icon: "✅", label: "Real shared words", blurb: "Words that reached BOTH languages from the same source (Tamil → English/Portuguese → Japanese, or Sanskrit/Buddhist words). These links are historically genuine." },
  eng: { icon: "🔤", label: "Katakana = English you already know", blurb: "Japanese writes foreign words in katakana. Many are English words Tamil speakers already use every day — free vocabulary (JLPT N5–N3)." },
  trick: { icon: "💡", label: "Sound-alike memory tricks", blurb: "Similar sound and meaning, used ONLY as a memory aid. Some linguists (e.g. Susumu Ohno) proposed a Tamil–Japanese relationship, but mainstream linguistics does not accept it — so treat these as mnemonics, not etymology. Useful for remembering, not for proving anything." },
};

export const tamilWords: TamilWord[] = [
  // ------------------------------------------------ real: Tamil words that travelled into Japanese (via English/Portuguese)
  r("カレー", "かれー", "curry", "கறி", "kaRi", "English 'curry' comes from Tamil kaRi (a sauce/relish) → Japanese カレー. JLPT N5."),
  r("マンゴー", "まんごー", "mango", "மாங்காய்", "maangaay", "mango ← Tamil maangaay (via Portuguese manga). Japanese マンゴー."),
  r("チーク", "ちーく", "teak (wood)", "தேக்கு", "thEkku", "teak ← Malayalam/Tamil thEkku → Japanese チーク."),
  r("カタマラン", "かたまらん", "catamaran (twin-hull boat)", "கட்டுமரம்", "kattumaram", "catamaran ← Tamil kattu-maram ('tied logs') → Japanese カタマラン."),
  r("ライス", "らいす", "rice", "அரிசி", "arisi", "English 'rice' is traced back through Greek oryza to a Dravidian word like Tamil arisi. Japanese ライス = cooked rice on a plate. (likely etymology)"),
  r("ジンジャー", "じんじゃー", "ginger", "இஞ்சி", "inji", "ginger is traced to Dravidian (Tamil inji / inji-ver) via Sanskrit and Greek. Japanese ジンジャー. (likely etymology)"),
  r("ペッパー", "ぺっぱー", "pepper", "மிளகு / பிப்பலி", "miLagu / pippali", "'pepper' ← Sanskrit pippalī (long pepper), Tamil also has pippali. Japanese ペッパー."),
  // ------------------------------------------------ real: Portuguese loanwords in both languages
  r("ボタン", "ぼたん", "button", "பொத்தான்", "poththaan", "Both ← Portuguese botão. Japanese ボタン and Tamil பொத்தான் are cousins!"),
  r("パン", "ぱん", "bread", "பன் / பாவ்", "pan / paav", "Japanese パン ← Portuguese pão. Tamil 'paav' (as in paav-bhaji) ← the same Portuguese pão."),
  r("タバコ", "たばこ", "cigarette / tobacco", "புகையிலை (tobacco)", "pugaiyilai", "Japanese タバコ ← Portuguese tabaco; Tamil also uses the borrowed 'tobacco'."),
  r("ホース", "ほーす", "hose", "ஹோஸ்", "hOs", "Same English word in both."),
  // ------------------------------------------------ real: Sanskrit / Buddhist words shared via Chinese Buddhism (bonus, rarely on JLPT)
  r("閻魔", "えんま", "Enma, king of hell (Yama)", "எமன்", "Eman", "Both ← Sanskrit Yama. (Japanese reached it via Chinese 閻魔.) Bonus word."),
  r("奈落", "ならく", "hell / bottom of an abyss", "நரகம்", "naragam", "Both ← Sanskrit naraka. (奈落の底 = rock bottom.) Bonus word."),
  r("刹那", "せつな", "an instant", "க்ஷணம்", "kshaNam", "Both ← Sanskrit kṣaṇa (a moment). Bonus word."),
  r("旦那", "だんな", "husband / master / shopkeeper", "தானம் (தானபதி)", "thaanam", "Both ← Sanskrit dāna (giving; the donor/patron). 旦那さん = (someone's) husband. N3 vocabulary."),
  r("禅", "ぜん", "Zen", "தியானம்", "dhyaanam", "Both ← Sanskrit dhyāna (meditation); Zen came via Chinese chán."),
  r("三昧", "ざんまい", "absorption / indulging in", "சமாதி", "samaadhi", "Both ← Sanskrit samādhi. 読書三昧 = absorbed in reading."),
  r("曼荼羅", "まんだら", "mandala", "மண்டலம்", "maNdalam", "Both ← Sanskrit maṇḍala."),
  r("瑠璃", "るり", "lapis / cat's-eye (deep blue)", "வைடூரியம்", "vaiDooriyam", "Both ← Sanskrit vaiḍūrya (a gem). Bonus word."),
  r("舎利", "しゃり", "relics / (sushi) rice", "சரீரம்", "sareeram", "Both ← Sanskrit śarīra (body). In sushi shops 'shari' = rice."),
  r("阿修羅", "あしゅら", "asura (demon)", "அசுரன்", "asuran", "Both ← Sanskrit asura."),
  r("夜叉", "やしゃ", "yaksha (spirit)", "யட்சன்", "yatchan", "Both ← Sanskrit yakṣa."),
  r("般若", "はんにゃ", "wisdom (prajñā) / Hannya mask", "பிரஞ்ஞை", "pirajnai", "Both ← Sanskrit prajñā."),
  r("菩薩", "ぼさつ", "bodhisattva", "போதிசத்துவர்", "bOdhisaththuvar", "Both ← Sanskrit bodhisattva."),
  r("袈裟", "けさ", "monk's robe", "காஷாயம்", "kaashaayam", "Both ← Sanskrit kaṣāya (saffron/ochre robe)."),
  r("卒塔婆", "そとば", "stupa-shaped grave tablet", "ஸ்தூபி", "sthoopi", "Both ← Sanskrit stūpa."),
  r("仏", "ほとけ / ぶつ", "Buddha", "புத்தர்", "buththar", "Both ← Sanskrit Buddha."),
  r("僧", "そう", "Buddhist monk", "சங்கம் (saṅgha)", "sangam", "僧 ← 僧伽 saṅgha (Sanskrit); Tamil சங்கம் is the same word."),
  r("茶", "ちゃ", "tea", "சாய் / தேநீர்", "chaay / thEneer", "'cha' and 'chai' both come from Chinese 茶. Tamil சாய் (chai) and Japanese 茶 are cousins. N5."),

  // ------------------------------------------------ eng: katakana = English (huge free vocabulary)
  e("バス", "ばす", "bus", "பஸ்", "bus"), e("ホテル", "ほてる", "hotel", "ஹோட்டல்", "hOttal"), e("レストラン", "れすとらん", "restaurant", "ரெஸ்டாரன்ட்", "restaurant"),
  e("タクシー", "たくしー", "taxi", "டாக்ஸி", "taxi"), e("トイレ", "といれ", "toilet", "டாய்லெட்", "toilet"), e("シャワー", "しゃわー", "shower", "ஷவர்", "shower"),
  e("ベッド", "べっど", "bed", "பெட்", "bed"), e("テーブル", "てーぶる", "table", "டேபிள்", "table"), e("ドア", "どあ", "door", "டோர்", "door"),
  e("エアコン", "えあこん", "air-conditioner", "ஏசி", "AC", "Japanese エアコン = air con (AC)"), e("アパート", "あぱーと", "apartment", "அபார்ட்மெண்ட்", "apartment"),
  e("エレベーター", "えれべーたー", "elevator", "லிஃப்ட்", "lift", "Tamil says 'lift' (British); Japanese says 'elevator' (American)"),
  e("ノート", "のーと", "notebook", "நோட்டு", "nOttu"), e("ペン", "ぺん", "pen", "பேனா", "pEnaa"), e("テスト", "てすと", "test", "டெஸ்ட்", "test"),
  e("テレビ", "てれび", "television", "டிவி", "TV"), e("ラジオ", "らじお", "radio", "ரேடியோ", "rEdiyO"), e("カメラ", "かめら", "camera", "கேமரா", "camera"),
  e("コンピューター", "こんぴゅーたー", "computer", "கம்ப்யூட்டர்", "computer"), e("スマホ", "すまほ", "smartphone", "ஸ்மார்ட்போன்", "smartphone", "スマホ is short for スマートフォン"),
  e("インターネット", "いんたーねっと", "internet", "இன்டர்நெட்", "internet"), e("メール", "めーる", "e-mail", "மெயில்", "mail"), e("ニュース", "にゅーす", "news", "நியூஸ்", "news"),
  e("コピー", "こぴー", "photocopy", "காபி / ஜெராக்ஸ்", "copy / xerox"), e("プリンター", "ぷりんたー", "printer", "பிரிண்டர்", "printer"), e("パスポート", "ぱすぽーと", "passport", "பாஸ்போர்ட்", "passport"),
  e("ビザ", "びざ", "visa", "விசா", "visa"), e("チケット", "ちけっと", "ticket", "டிக்கெட்", "ticket"), e("カード", "かーど", "card", "கார்டு", "card"),
  e("コーヒー", "こーひー", "coffee", "காபி", "kaapi"), e("ケーキ", "けーき", "cake", "கேக்", "cake"), e("ジュース", "じゅーす", "juice", "ஜூஸ்", "juice"),
  e("ビール", "びーる", "beer", "பீர்", "beer"), e("アイスクリーム", "あいすくりーむ", "ice cream", "ஐஸ்கிரீம்", "ice cream"), e("ミルク", "みるく", "milk", "மில்க்", "milk", "Tamil usually says பால் (paal); 'milk' is also used"),
  e("スポーツ", "すぽーつ", "sports", "ஸ்போர்ட்ஸ்", "sports"), e("サッカー", "さっかー", "soccer / football", "கால்பந்து / ஃபுட்பால்", "football"), e("テニス", "てにす", "tennis", "டென்னிஸ்", "tennis"),
  e("ゲーム", "げーむ", "game", "கேம்", "game"), e("ガソリン", "がそりん", "gasoline / petrol", "பெட்ரோல்", "petrol", "Japanese uses ガソリン, Tamil 'petrol'"), e("ホーム", "ほーむ", "(station) platform", "பிளாட்பாரம்", "platform", "In Japanese stations ホーム = platform (from 'platform')"),
  e("ストーブ", "すとーぶ", "stove / heater", "ஸ்டவ்", "stove"), e("ビル", "びる", "(tall) building", "பில்டிங்", "building", "ビル is short for ビルディング"), e("マラソン", "まらそん", "marathon", "மாரத்தான்", "marathon"),

  // ------------------------------------------------ trick: sound-alike memory aids
  t("からい", "からい", "spicy", "காரம்", "kaaram", "karai ≈ kaaram — almost identical sound and the same meaning! (a coincidence, but a great memory hook) N5"),
  t("黒", "くろ", "black", "கருப்பு / கரு", "karuppu / karu", "kuro ≈ karu(ppu): same sound pattern k-r. N5"),
  t("暗い", "くらい", "dark", "கருமை", "karumai", "kurai ≈ karumai (darkness) N5"),
  t("小さい", "ちいさい", "small", "சிறிய", "siriya", "chiisai ≈ siriya — both start 'chi/si' and mean small. N5"),
  t("遠い", "とおい", "far", "தூரம்", "thooram", "tooi ≈ thooram (distance). N5"),
  t("広い", "ひろい", "wide", "விரிவு", "virivu", "hiroi ≈ virivu (wide, spread out). N5"),
  t("食べる", "たべる", "to eat", "தின்", "thin", "ta-be-ru ≈ thin (to eat). N5"),
  t("話す", "はなす", "to speak", "பேசு", "pEsu", "hanasu ≈ pEsu (speak). Ohno proposed a regular p→h shift — mnemonic only. N5"),
  t("歯", "は", "tooth", "பல்", "pal", "ha ≈ pal (p→h pattern). N5"),
  t("蛇", "へび", "snake", "பாம்பு", "paambu", "hebi ≈ paambu (p→h pattern). Fun one!"),
  t("足", "あし", "foot / leg", "அடி", "adi", "ashi ≈ adi (foot, step). N5"),
  t("家", "いえ", "house", "இல்லம்", "illam", "ie ≈ illam (home, house). N5"),
  t("森", "もり", "forest", "மரம்", "maram", "mori ≈ maram (tree). N5"),
  t("村", "むら", "village", "ஊர்", "oor", "mura ≈ oor (village / town). N4"),
  t("兄", "あに", "my older brother", "அண்ணன்", "annan", "ani ≈ annan — the classic example. N5"),
  t("姉", "あね", "my older sister", "அக்கா / அண்ணி", "akka / anni", "ane ≈ akka. N5"),
  t("弟", "おとうと", "younger brother", "தம்பி", "thambi", "otouto ≈ thambi (weak sound link, easy to recall). N5"),
  t("息子", "むすこ", "son", "மகன்", "magan", "musuko ≈ magan. N4"),
  t("娘", "むすめ", "daughter", "மகள்", "magaL", "musume ≈ magaL. N4"),
  t("酒", "さけ", "alcohol / sake", "சாராயம்", "saaraayam", "sake ≈ saaraayam (liquor). N5"),
  t("木", "き", "tree", "கிளை", "kiLai", "ki ≈ kiLai (branch). N5"),
  t("風", "かぜ", "wind", "காற்று", "kaatru", "kaze ≈ kaatru. N5"),
  t("聞く", "きく", "to listen / ask", "கேள்", "kEL", "kiku ≈ kEL. N5"),
  t("切る", "きる", "to cut", "கீறு", "keeru", "kiru ≈ keeru (to slice/scratch). N5"),
  t("買う", "かう", "to buy", "கொள்", "koL", "kau ≈ koL (as in கொள்முதல் = purchase). N5"),
  t("言う", "いう", "to say", "உரை", "urai", "iu ≈ urai (speech, to tell). N5"),
  t("死ぬ", "しぬ", "to die", "சாகு", "saagu", "shinu ≈ saagu. N4"),
  t("好き", "すき", "to like", "சுகம்", "sugam", "suki ≈ sugam (pleasure, comfort) — 'what I like feels sugam'. N5"),
  t("悪い", "わるい", "bad", "பொல்லாத", "polladha", "warui ≈ polladha (bad, wicked). N5"),
  t("太い", "ふとい", "thick / fat", "பருத்த", "parutha", "futoi ≈ parutha (thick, big-bodied). N4"),
  t("長い", "ながい", "long", "நெடு", "nedu", "nagai ≈ nedu (long). N5"),
  t("少し", "すこし", "a little", "சிறிது", "siridhu", "sukoshi ≈ siridhu. N5"),
  t("海", "うみ", "sea", "உவரி", "uvari", "umi ≈ uvari (an old Tamil word for sea / salt water). N5"),
  t("昔", "むかし", "long ago", "முன்காலம்", "munkaalam", "mukashi ≈ mun-kaalam (former time). N4"),
  t("甘い", "あまい", "sweet", "அமுது", "amudhu", "amai ≈ amudhu (nectar, sweet food). N5"),
  t("硬い", "かたい", "hard", "கடினம்", "kadinam", "katai ≈ kadinam — nearly identical sound and meaning. N4"),
  t("飲む", "のむ", "to drink", "நுகர்", "nugar", "nomu ≈ nugar (to consume, to taste) — weak but easy. N5"),
  t("ない", "ない", "there is not", "இல்லை", "illai", "Both are the 'not exist' word: nai = illai. ある ≈ இருக்கு / உண்டு. N5"),
  t("怖い", "こわい", "scary", "கொடிய", "kodiya", "kowai ≈ kodiya (fierce, cruel) — a memory hook. N4"),
];
