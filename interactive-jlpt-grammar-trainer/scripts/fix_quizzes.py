import re, pathlib, sys
FIXES = [
 ("unit7.ts", '"Potential of 見る?"', '["Potential of 見る?", ["見える", "見られる", "見るれる", "見りえる"], 1, "Group 2: る → られる. (見える means \'is visible\' — a different word.)"],'),
 ("unit7.ts", '「I can speak Japanese.」 natural?', '["「I can\'t read kanji.」 Choose the correct sentence.", ["漢字が読めません", "漢字が読むません", "漢字を読めりません", "漢字が読まれません"], 0, "読む → 読める (potential); negative 読めません. The object usually takes が."],'),
 ("unit7.ts", '"Opposite of 食べやすい?"', '["Opposite of 食べやすい (easy to eat)?", ["食べにくい", "食べすぎる", "食べたことがある", "食べておく"], 0, "やすい (easy) ↔ にくい (hard)."],'),
 ("unit7.ts", '私は行きたがる"', '["Which is the natural way to say \'I want to go\' (about YOURSELF)?", ["私は行きたいです", "私は行きたがります", "私は行きたがっているです", "私は行きたいがります"], 0, "For your own wish use たい. がる describes other people\'s visible wishes."],'),
 ("unit8.ts", "I left phone while sleeping", '["「While I was sleeping, it rained.」", ["寝ている間に雨が降った", "寝た間に雨が降った", "寝る間に雨が降った", "寝て間に雨が降った"], 0, "Ongoing action: ている間に."],'),
 ("unit8.ts", "(sequence focus)", '["「After doing homework, go.」 (sequence focus)", ["宿題をしてから行く", "宿題をする前に行く", "宿題をしてまえに行く", "宿題をしたまえに行く"], 0, "てから stresses \'after finishing A, then B\'. 前に = before (the opposite)."],'),
 ("unit8.ts", "「When I press the button, it opens.」", '["「When I press the button, it opens.」 (automatic result)", ["ボタンを押すと開く", "ボタンを押したと開く", "ボタンを押すとき開くと", "ボタンを押してと開く"], 0, "Natural/automatic result: dictionary form + と."],'),
 ("unit9.ts", "It's cheap and close, so nice", '["Which sentence correctly lists reasons with し?", ["安いし、近いし、いい", "安いし近いしのいい", "安いのし近いのし", "安いと近いとし"], 0, "Plain form + し, repeated, then the conclusion."],'),
 ("unit10.ts", "Can you say 私はほしい?", '["「I want a new phone.」", ["新しい携帯がほしいです", "新しい携帯がほしがっています", "新しい携帯をほしいがります", "新しい携帯はほしがるです"], 0, "ほしい marks the wanted thing with が (を is also heard); the subject is I."],'),
 ("unit10.ts", "For his want (3rd person), natural?", '["「He wants a car.」 (about him, showing signs)", ["彼は車をほしがっている", "彼は車がほしい", "彼は車をほしいがる", "彼は車がほしがる"], 0, "Other people\'s visible wants: ほしがる (+ を, ている)."],'),
 ("unit10.ts", '"どうする方がいいですか"', '["「What should I do?」 (ask for advice with た方がいい)", ["どうした方がいいですか", "どうする方がいいですか", "どうしる方がいいですか", "どうして方がいいですか"], 0, "た-form + 方がいい, even when asking about the future."],'),
 ("unit10.ts", "Which shows relief?", '["「I\'m sorry for being late.」", ["遅れてすみません", "遅れてよかった", "遅れなくてもいい", "遅れたことがある"], 0, "て-form + すみません apologises for the reason."],'),
 ("unit11.ts", "Strongest denial of possibility?", '["The opposite of 来るはずだ (\'he should come\') is…", ["来るはずがない", "来るはずだった", "来るべきだ", "来るわけではない"], 0, "はずだ ↔ はずがない (cannot possibly)."],'),
 ("unit11.ts", "(logical)", '["「There\'s no way he forgot.」 (logical impossibility)", ["忘れたはずがない", "忘れたはずだ", "忘れたわけではない", "忘れたばかりだ"], 0, "はずがない = impossible by logic."],'),
 ("unit11.ts", "Which pair is similar strength?", '["「It must be raining there.」", ["向こうは雨に違いない", "向こうは雨にことだ", "向こうは雨なにちがいない", "向こうは雨だちがいない"], 0, "Noun + に違いない (no だ/な before に)."],'),
 ("unit11.ts", "Expensive doesn't necessarily mean good.", '["「Expensive doesn\'t necessarily mean good.」", ["高いからといって、いいとは限らない", "高いからといって、いいはずがない", "高いからといって、いいべきではない", "高いからといって、いいわけがあった"], 0, "〜とは限らない = not necessarily."],'),
 ("unit11.ts", "Which denies a stereotype gently?", '["「Not everyone likes sushi.」", ["みんなが寿司を好きだとは限らない", "みんなが寿司を好きだとはずがない", "みんなが寿司を好きなことだ", "みんなが寿司を好きだとからない"], 0, "Plain form + とは限らない."],'),
 ("unit12.ts", "As soon as I arrive, I'll call", '["Which sentence uses the formal ~次第 (\'as soon as\') pattern?", ["着き次第連絡する", "着いたばかり連絡する", "着くところ連絡する", "着き次連絡する"], 0, "ます-stem + 次第 = as soon as (formal/business)."],'),
 ("unit13.ts", "Which is formal written?", '["「The phone rang right in the middle of the meeting.」", ["会議の最中に電話が鳴った", "会議の最中で電話が鳴った", "会議の最中を電話が鳴った", "会議の最中へ電話が鳴った"], 0, "Noun + の + 最中に."],'),
 ("unit13.ts", "(strong)", '["Which pattern is a direct, teacher-like \'You should ~\'?", ["もっと休むことだ", "もっと休むわけだ", "もっと休むばかりだ", "もっと休むところだ"], 0, "Dictionary form + ことだ = strong advice."],'),
]
bad = 0
for fname, needle, new in FIXES:
    p = pathlib.Path("src/data")/fname
    lines = p.read_text().split("\n")
    idx = [k for k, l in enumerate(lines) if needle in l and l.strip().startswith('["')]
    if len(idx) != 1:
        print(f"!! {fname}: needle {needle!r} matched {len(idx)} lines"); bad += 1; continue
    indent = re.match(r"\s*", lines[idx[0]]).group(0)
    lines[idx[0]] = indent + new
    p.write_text("\n".join(lines))
    print(f"fixed {fname}:{idx[0]+1}")
sys.exit(1 if bad else 0)
