"""Generate PWA icons + install-dialog preview images for Nihongo Path.

Run: python3 scripts/make_pwa_assets.py && python3 scripts/embed_assets.py   (embed_assets turns the PNGs into the text that the app serves)  (needs Pillow + /tmp/fonts/NotoSansJP.ttf)
"""
import os
from PIL import Image, ImageChops, ImageDraw, ImageFont

FONT = os.environ.get("JP_FONT", "/tmp/fonts/NotoSansJP.ttf")
ROSE, ROSE7, ORANGE = (225, 29, 72), (190, 18, 60), (249, 115, 22)
BG, WHITE, SLATE9, SLATE6, SLATE5, SLATE4 = (250, 247, 242), (255, 255, 255), (15, 23, 42), (71, 85, 105), (100, 116, 139), (148, 163, 184)
INDIGO, INDIGO50, INDIGO9 = (79, 70, 229), (238, 242, 255), (30, 27, 75)
EMER, EMER50, EMER8 = (16, 185, 129), (236, 253, 245), (6, 95, 70)
AMBER50, AMBER8, ROSE50, ROSE100 = (255, 251, 235), (146, 64, 14), (255, 241, 242), (255, 228, 230)

os.makedirs("scripts/assets-src/icons", exist_ok=True)
os.makedirs("scripts/assets-src/screenshots", exist_ok=True)


def font(size, weight=400):
    f = ImageFont.truetype(FONT, int(size))
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def grad(w, h, c1=ROSE, c2=ORANGE):
    hor = Image.linear_gradient("L").rotate(90, expand=True).resize((w, h))
    ver = Image.linear_gradient("L").resize((w, h))
    mask = ImageChops.add(hor, ver, scale=2.0)
    return Image.composite(Image.new("RGB", (w, h), c2), Image.new("RGB", (w, h), c1), mask)


def center_text(d, cx, cy, text, f, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    d.text((cx - (l + r) / 2, cy - (t + b) / 2), text, font=f, fill=fill)


def paste_round(img, tile, xy, radius):
    m = Image.new("L", tile.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, tile.size[0] - 1, tile.size[1] - 1], radius=radius, fill=255)
    img.paste(tile, xy, m)


# ---------------------------------------------------------------- icons
def make_icon(size, maskable=False, rounded=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg = grad(size, size)
    m = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(m)
    if maskable or not rounded:
        md.rectangle([0, 0, size, size], fill=255)
    else:
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
    img.paste(bg, (0, 0), m)
    d = ImageDraw.Draw(img)
    # glyph stays inside the maskable safe zone (central 80% circle)
    center_text(d, size / 2, size / 2, "日", font(size * (0.46 if maskable else 0.6), 800), WHITE)
    return img


for s in (96, 192, 512):
    make_icon(s).save(f"scripts/assets-src/icons/icon-{s}.png")
for s in (192, 512):
    make_icon(s, maskable=True).save(f"scripts/assets-src/icons/maskable-{s}.png")
make_icon(180, rounded=False).convert("RGB").save("scripts/assets-src/icons/apple-touch-icon.png")


# ---------------------------------------------------------------- UI kit for previews
class Canvas:
    def __init__(self, w, h, scale):
        self.k = scale
        self.img = Image.new("RGB", (w, h), BG)
        self.d = ImageDraw.Draw(self.img)

    def s(self, v):
        return int(v * self.k)

    def f(self, size, weight=400):
        return font(self.s(size), weight)

    def text(self, x, y, t, size, weight=400, fill=SLATE9):
        self.d.text((self.s(x), self.s(y)), t, font=self.f(size, weight), fill=fill)

    def tw(self, t, size, weight=400):
        return self.d.textlength(t, font=self.f(size, weight)) / self.k

    def rect(self, x, y, w, h, r, fill, outline=None, width=1):
        self.d.rounded_rectangle([self.s(x), self.s(y), self.s(x + w), self.s(y + h)], radius=self.s(r), fill=fill, outline=outline, width=self.s(width) if outline else 0)

    def pill(self, x, y, t, fg, bg, size=10):
        w = self.tw(t, size, 700) + 16
        self.rect(x, y, w, size + 10, (size + 10) / 2, bg)
        self.text(x + 8, y + 2, t, size, 700, fg)
        return w

    def circle_glyph(self, cx, cy, r, glyph, bg, fg, size):
        self.d.ellipse([self.s(cx - r), self.s(cy - r), self.s(cx + r), self.s(cy + r)], fill=bg)
        center_text(self.d, self.s(cx), self.s(cy), glyph, self.f(size, 800), fg)

    def wrap(self, t, size, maxw, weight=400):
        lines, cur = [], ""
        for w in t.split(" "):
            nxt = (cur + " " + w).strip()
            if self.tw(nxt, size, weight) <= maxw:
                cur = nxt
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    def hero(self, x, y, w, h):
        paste_round(self.img, grad(self.s(w), self.s(h)), (self.s(x), self.s(y)), self.s(24))

    def header(self, width, nav=False):
        self.rect(0, 0, width, 60, 0, WHITE)
        self.d.line([0, self.s(60), self.s(width), self.s(60)], fill=ROSE100, width=self.s(1.5))
        self.circle_glyph(34, 30, 17, "日", ROSE, WHITE, 18)
        self.text(60, 16, "Nihongo Path", 18, 800)
        self.text(60 + self.tw("Nihongo Path", 18, 800) + 8, 21, "N4 · N3", 13, 400, SLATE5)
        if nav:
            x = width - 24
            for item in reversed(["Grammar", "Words", "Reading", "Listening", "Tamil", "Exam", "App"]):
                x -= self.tw(item, 13, 600) + 22
                self.text(x, 21, item, 13, 600, SLATE6)

    def mic(self, cx, cy, r):
        self.d.ellipse([self.s(cx - r), self.s(cy - r), self.s(cx + r), self.s(cy + r)], fill=ROSE)
        k = r / 48
        self.rect(cx - 9 * k, cy - 24 * k, 18 * k, 30 * k, 9 * k, WHITE)
        self.d.arc([self.s(cx - 17 * k), self.s(cy - 16 * k), self.s(cx + 17 * k), self.s(cy + 16 * k)], 0, 180, fill=WHITE, width=self.s(4 * k))
        self.rect(cx - 2 * k, cy + 15 * k, 4 * k, 9 * k, 1, WHITE)
        self.rect(cx - 10 * k, cy + 23 * k, 20 * k, 4 * k, 2, WHITE)

    def save(self, path):
        self.img.save(path, optimize=True)


def hero_block(c, x, y, w, h, big=False):
    c.hero(x, y, w, h)
    c.text(x + 20, y + 18, "JLPT N4 → N3 · FOR TAMIL SPEAKERS", 10, 800, ROSE100)
    c.text(x + 20, y + 34, "日本語の道", 28 if big else 26, 800, WHITE)
    c.text(x + 20, y + (74 if big else 72), "Your grammar path", 17, 700, WHITE)
    yy = y + (102 if big else 100)
    for line in c.wrap("Learn with Tamil comparisons → quiz → speaking test (10 sentences). Every 5 grammars: a combined speaking exam.", 12, w - 40):
        c.text(x + 20, yy, line, 12, 400, (255, 240, 242))
        yy += 17
    c.text(x + 20, yy + 8, "35%", 30, 800, WHITE)
    c.text(x + 20, yy + 50, "25/70 grammar · 4/14 unit exams", 11, 500, ROSE100)
    bx = x + 20 + max(c.tw("25/70 grammar · 4/14 unit exams", 11, 500), 70) + 18
    c.rect(bx, yy + 16, c.tw("Continue → 〜てもいい", 13, 800) + 28, 38, 12, WHITE)
    c.text(bx + 14, yy + 24, "Continue → 〜てもいい", 13, 800, ROSE7)
    c.rect(x + 20, y + h - 22, w - 40, 7, 4, (245, 160, 140))
    c.rect(x + 20, y + h - 22, (w - 40) * 0.35, 7, 4, WHITE)


FEATURES = [("語", ROSE, "1,089+ words", "N4 + N3 · Tamil hooks"), ("読", INDIGO, "12 reading sets", "Notices · emails · essays"),
            ("聴", (217, 119, 6), "18 listening sets", "Audio · all JLPT types"), ("話", EMER, "70 grammar points", "Speaking tests · reviews")]
GRAMMAR = [("#1", "〜たことがある", "Have done ~ before", "Completed", EMER8, (209, 250, 229)),
           ("#2", "〜てもいい", "It's OK to ~ / May I ~?", "Quiz next", AMBER8, (254, 243, 199)),
           ("#3", "〜てはいけない", "Must not ~ (prohibition)", "Start", ROSE7, (255, 228, 230))]


def feature_tile(c, x, y, w, h, item):
    g, col, title, sub = item
    c.rect(x, y, w, h, 18, WHITE)
    c.circle_glyph(x + 30, y + 30, 16, g, col, WHITE, 15)
    c.text(x + 14, y + 52, title, 14, 800)
    c.text(x + 14, y + 72, sub, 10, 400, SLATE5)


def grammar_card(c, x, y, w, h, item):
    num, title, meaning, status, fg, bg = item
    c.rect(x, y, w, h, 18, WHITE)
    c.text(x + 16, y + 12, num, 10, 500, SLATE5)
    sw = c.tw(status, 10, 700) + 16
    c.pill(x + w - sw - 14, y + 10, status, fg, bg)
    c.text(x + 16, y + 28, title, 20, 800)
    c.text(x + 16, y + 58, meaning, 12, 400, SLATE6)


# ---------------------------------------------------------------- narrow: home (1080x1920 = 360x640 @3x)
c = Canvas(1080, 1920, 3)
c.header(360)
hero_block(c, 16, 76, 328, 262)
for i, item in enumerate(FEATURES):
    feature_tile(c, 16 + (i % 2) * 168, 352 + (i // 2) * 100, 160, 90, item)
c.text(16, 560, "Unit 1: Experience & Permission", 16, 800)
c.pill(16 + c.tw("Unit 1: Experience & Permission", 16, 800) + 8, 563, "N4", ROSE7, ROSE100)
grammar_card(c, 16, 592, 328, 84, GRAMMAR[0])
c.save("scripts/assets-src/screenshots/home-narrow.png")

# ---------------------------------------------------------------- narrow: speaking test
c = Canvas(1080, 1920, 3)
c.header(360)
c.text(16, 72, "← Grammar path", 12, 500, SLATE5)
c.text(16, 90, "〜たことがある", 30, 800)
c.pill(16, 136, "N4", ROSE7, ROSE100)
c.pill(52, 136, "Unit 1 · #1", SLATE6, (241, 245, 249))
c.text(16, 160, "Have done ~ before (life experience)", 13, 400, SLATE6)
tx = 16
for label, active in (("① Learn", False), ("② Quiz", False), ("③ Speaking test", True)):
    w = c.tw(label, 12, 700) + 24
    c.rect(tx, 186, w, 32, 12, SLATE9 if active else WHITE)
    c.text(tx + 12, 192, label, 12, 700, WHITE if active else SLATE6)
    tx += w + 8
c.rect(16, 230, 328, 392, 20, WHITE)
c.text(30, 242, "Sentence 1 / 10", 11, 500, SLATE5)
c.text(250, 242, "Need 6/10", 11, 500, SLATE5)
c.rect(30, 262, 300, 5, 3, (241, 245, 249))
c.rect(30, 262, 30, 5, 3, INDIGO)
c.rect(30, 278, 300, 78, 14, INDIGO50)
c.text(42, 288, "SAY THIS IN JAPANESE", 10, 800, INDIGO)
c.text(42, 306, "I have eaten sushi before.", 19, 700, INDIGO9)
c.text(42, 334, "Grammar hint: 〜たことがある", 10, 600, INDIGO)
c.mic(180, 404, 38)
center_text(c.d, c.s(180), c.s(456), "Tap the mic and speak Japanese", c.f(11, 500), SLATE5)
c.rect(30, 472, 300, 138, 14, EMER50, outline=(110, 231, 183), width=1.5)
c.text(42, 480, "Correct!  Grammar pattern found", 14, 800, EMER8)
c.text(42, 502, "You said:", 10, 500, SLATE5)
c.text(42, 516, "すしを たべた ことが あります", 17, 700)
c.text(42, 542, "（すしを食べたことがあります）", 13, 400, SLATE5)
px = 42
px += c.pill(px, 572, "〜たことがある  OK", EMER8, (209, 250, 229)) + 6
c.pill(px, 572, "Match 100%", SLATE6, (241, 245, 249))
c.rect(16, 634, 160, 40, 12, WHITE, outline=(203, 213, 225), width=1)
center_text(c.d, c.s(96), c.s(654), "Try again", c.f(12, 700), SLATE6)
c.rect(184, 634, 160, 40, 12, INDIGO)
center_text(c.d, c.s(264), c.s(654), "Next sentence →", c.f(12, 800), WHITE)
c.save("scripts/assets-src/screenshots/speaking-narrow.png")

# ---------------------------------------------------------------- wide: home (1920x1080 = 1280x720 @1.5x)
c = Canvas(1920, 1080, 1.5)
c.header(1280, nav=True)
X, W = 128, 1024
hero_block(c, X, 84, W, 244, big=True)
for i, item in enumerate(FEATURES):
    feature_tile(c, X + i * 261, 344, 241, 90, item)
c.text(X, 456, "Unit 1: Experience, Permission & Rules", 18, 800)
c.pill(X + c.tw("Unit 1: Experience, Permission & Rules", 18, 800) + 10, 461, "N4", ROSE7, ROSE100)
for i, item in enumerate(GRAMMAR):
    grammar_card(c, X + i * 261, 492, 241, 90, item)
c.rect(X + 3 * 261, 492, 241, 90, 18, INDIGO50, outline=INDIGO, width=1.5)
c.text(X + 3 * 261 + 16, 504, "SECTION 5 · COMBINED EXAM", 10, 800, INDIGO)
c.text(X + 3 * 261 + 16, 524, "All 5 grammars", 16, 800)
c.text(X + 3 * 261 + 16, 548, "in one sentence", 16, 800)
c.save("scripts/assets-src/screenshots/home-wide.png")

print("done", sorted(os.listdir("public/icons")), sorted(os.listdir("public/screenshots")))
