# Design system: dlt (data load tool), Python Brasil 2026

Living spec for the deck's look. It derives from the blog's `DESIGN.md`
(`alanmmolina.github.io`): the base is the same, and this file records what the
slides add. The background, hairline, gray and lime palette, and the pieces in
section 5, come from the
[Python Brasil 2026 template](https://github.com/rodbv/pybr2026-slides),
because the talk is at the event. The deck is a HyperFrames slideshow and the
live CSS is `slides/composition/deck.css`. When the two disagree, the CSS wins
and this file gets corrected.

> **Language.** The talk is delivered entirely in Brazilian Portuguese. Slide
> copy, lesson text and example output face the audience and stay in PT-BR.
> This document is agent documentation and is written in English; the material
> is not. Do not translate audience-facing strings.

---

## 1. General principle

Two layers under the same tension as the blog.

1. **The base** is monochrome, zinc night, terminal-adjacent. Roboto + Fira
   Code, hairlines and whitespace. It is the speaker's identity and it does not
   change.
2. **The annotation** is the hand-drawn layer (Excalifont and sloppy strokes)
   pointing at things in the base. This is where the **dlt** brand enters.

Master rule: chrome never takes color. Brand color only appears on an element
that looks written or drawn, and every mention of the tool uses the brand
spelling.

---

## 2. Palette

### Base (zinc night, inherited from the blog)

| Token | Hex | Where |
|---|---|---|
| Canvas | `#0F0F0F` | background of every scene |
| Hairline | `#3A3A3A` | 1px borders and structural lines |
| Gray | `#ABABAB` | metadata, labels, prompts, neutral arrows |
| Secondary | `#eaeaea` | body and subs |
| Ink | `#fafafa` | headlines, numbers, emphasis |
| Surface chip | `#292929` | `.mono` background and logo cells |
| Whisper highlight | `rgba(100,100,100,0.1)` | `.accent` and the `.mono` chips |

The canvas, the hairline and the gray follow the **Python Brasil 2026** palette
(`#0F0F0F` black, `#3A3A3A` dark card border, `#ABABAB` secondary text). They
used to be `#09090b`, `#292929` and `#727272`, from the blog.

`#727272` survives only as a **drawn stroke** (outer sloppy frame, chart axis,
filled tip of the whoami timeline). It is geometry, not text, and it has no
counterpart in the event palette: lightening the text while keeping the stroke
leaves the two frame levels distinguishable (outer `#727272`, inner `#4c4c55`).

Body text sits at `#fafafa` / `#eaeaea`, monochrome, and not on the event's
off-white `#E8F4BA`: the base is the speaker's identity, inherited from the
blog, and a greenish tint would change that. Both options pass AAA (`18.36:1`
and `16.50:1` against `#0F0F0F`); the difference is tone, not legibility.

### Annotation gray scale

The drawn layer needs more than one gray, because small handwritten text
disappears into the text gray and an SVG stroke on the hairline disappears
altogether.

| Token | Hex | Where |
|---|---|---|
| Annotation | `#b0b0b0` | Excalifont in diagram captions and notes |
| Annotation dim | `#8a8a8a` | secondary annotation and subcaptions |
| Label | `#b8b8b8` | tags and file names |
| Drawn stroke | `#4c4c55` | sloppy frame stroke in gray |

`#4c4c55` is not the hairline. As a drawn stroke, the CSS border `#3A3A3A`
stays invisible; the drawing needs a step above it. When boxes nest, the pair
separates the levels: the outer box takes `#727272` and the inner ones `#4c4c55`.

### dlt brand

| Token | Hex | Rule |
|---|---|---|
| Lime | `#B7FF06` | `dlt` wordmark, bars and numbers, hero frame |
| Teal | `#57c1d4` | handwritten glyphs, Excalifont flow titles, `dltHub` |
| Teal green | `#00bfa5` | cards and frames on the "what is dlt" slide |
| Navy | `#191836` | reserved |
| Indigo | `#4b4897` | reserved |

The lime is the **Python Brasil 2026 lime** (`#B7FF06`), standing in for the
**dlt** brand `#c5d200`. The difference is tone, not role: the lime is still
the tool's color. Teal stays the **dltHub** color. The lime-plus-teal pair is
the **dlt** brand, and the event violet stays out so it does not overwrite
that. On a light background the lime gives 1.16:1, so lime text lives only on
the dark canvas.

### Callouts and code

Callouts keep the blog's semantic exception: note `#448aff`, warn and question
`#dba642`, Roboto 600 title in the hue, border at 27% alpha, wash at 6%.
Nothing beyond that. When three elements need to tell each other apart in
parallel, the red/green/blue trio does that job (on the sources slide, each
source kind carries a primary on its icon and the label stays white). These
are signaling colors, not brand colors, and they do not replace lime or teal.

Red `#e5484d` stays out of panels and concept pairs: full-screen it reads as
"wrong", and valid options would come out flagged as errors. It was already
tried on the schema contracts and went back to amber.

Syntax is the custom Zed theme (`custom-dark` in
`alanmmolina.github.io/quartz/styles/themes/`), the same one the blog runs:
`#ff7878` keyword, storage and operator; `#9696ff` function, type, decorator
and attribute; `#fed85b` parentheses and brackets; `#ff9933` named arguments;
`#f8f8f8` number, boolean and null; `#6b737c` comment and docstring; `#cccccc`
text. String is `#9ecbff`, not the theme's `#aae682`: the green did not hold up
full-screen. The blog runs with `keepBackground: false`, so only token color
comes through and the background stays the page's, same as here.

Third-party logos enter in their own brand colors, always as inline SVG or in
`slides/composition/vendor/logos/`. That is not a design token and it does not
spread.

**What does not enter:** gradients, shadows, neon, emoji, filled card
backgrounds, `#000000` and pure white outside a logo, Inter, serif.

---

## 3. Typography

| Role | Font | Use |
|---|---|---|
| Headlines, body, UI | Roboto | 700 headline, 600 title, 400 body |
| Code, metadata, paths | Fira Code | 400 and 600 |
| Hand annotation | Excalifont | diagram captions, flow titles, prompts |
| `dlt` wordmark | Fragment Mono | 400, lime. Free to swap in ABC Diatype Semi-Mono, which is commercial |
| RAWG wordmark | Montserrat | 900, only in the `.ra-logo` logo |

Excalifont degrades to Comic Sans MS when the woff2 does not load. Fonts are
vendored in `slides/composition/vendor/fonts/`, with the OFL license beside
them.

Chrome never uses Excalifont. The hand layer never uses Roboto or Fira Code on
brand glyphs.

---

## 4. Surfaces

No filled cards. Elevation is border and whitespace. The radius follows the
surface rather than a single value:

| Surface | Radius | Where |
|---|---|---|
| Chrome | `5px` | chips, `.accent`, cards, code boxes, callouts |
| Drawn | `10px` | sloppy callout, cost item, "what is dlt" slide cards |
| Brand chip | `3px` | inline lime and teal tint |
| Photo | `2px` | the mural's polaroid effect |

Code boxes get a transparent background, a hairline and 5px, and code never
receives a fill. The inline `.mono` chip uses bg `#292929`, 5px radius and Fira
Code. `.split` is a 1fr/1fr grid with 56px gap; code columns use 28px
horizontal padding and a 38px `pre`, which lands at about 32 characters per
line. Longest lines break inside the code instead of blowing out the layout.
The slide footer is Fira Code `#ABABAB`, with the site logo on the right.

---

## 5. The dlt brand layer

Premise: the base is monochrome and solid, and the brand enters hand-annotated.
Brand color implies an element that looks written or drawn.

Where the color lives today.

Teal `#57c1d4` appears on the `$` prompts, on the Excalifont titles of the flow
boxes (SOURCE, PIPELINE, DESTINATION) and on the phase digits. It is the same
teal as the `Hub` wordmark in `dltHub`. Lime `#B7FF06` is the `dlt` wordmark,
the bar and the "34x" annotation on the agent-native chart, the hero frame on
the platform map, the contact values and **every flow arrow** (the ones on the
flows, the ones on the state stations and the branch on the final map): it is
**dlt** that moves the data. Teal green `#00bfa5` sits on the cards and frames
of the "what is dlt" slide. Gray `#4c4c55` marks the sloppy frames subordinate
to the colored ones, in the inner boxes of the schema contracts and the boxes
of the platform map. Navy and indigo stay reserved.

**Institutional logos** (whoami): SVGs in `vendor/logos/` for Branching Minds,
iFood, Visagio and UNESP. The `whoami` title is an inline code chip in Fira
Code 72. Horizontal timeline, vertically centered: 5px vertical ticks in
`#727272` at the change years, a 5px spine in two bands holding the real
periods (blue `#4a9eed` UNESP, green `#a9fdac` Visagio, red `#ea1d2c` iFood,
cyan `#3ac1d0` Branching Minds), roughly 160px icons above the line, a two-line
caption with no year band, and a gray arrowhead at the end. Individual rotation
from -3° to +3°. Animation left to right, once per activation: segments draw
in, logos cascade, captions rise last.

**Personal** (second whoami): a mural of 5 wobbly frames at 302×374 in
`#fafafa`, photo 286×358 in black and white with
`grayscale(1) contrast(1.08) brightness(0.94)`, Excalifont caption 34 in white
and a file name in Fira Code 22 gray, tilt from -1.8° to +1.8°. The photos in
`vendor/photos/` are SVG placeholders.

**Python Brasil 2026 identity** (event). Pieces from the
[official template](https://github.com/rodbv/pybr2026-slides), by Ana Terhorst
for APyB, in `composition/vendor/pybr/`. Manual rule: use them as they are,
with no distortion, no recoloring outside the palette and no effects. Uniform
scale (Shift at the corner), and one sticker per slide is usually enough.

| Slide | Piece | Where |
|---|---|---|
| 01 cover | `lockup-on-dark.png` (event wordmark + dragon, in off-white) | centred above the headline |
| 23 questions | `sticker-witch.png` (surfing witch) | bottom right |

The lockup is the `on-dark` version, off-white `#E8F4BA` on transparent, made
for a dark canvas. It is the only piece that enters with color from outside the
local palette, and it does not spread: event identity, not a design token. On
the cover it opens the slide as a normal flex item (it replaced the old
`~/talks/pybr2026` path, which was the only thing in that slot and carried no
information the footer did not already carry). On "questions" it sits outside
the flex flow (`position: absolute`) so it does not push the centred block.

The background, the hairline, the gray and the lime are already the event's
(see section 2), so the pieces land on the same material.

**What did not come from the event template.** The template is a generic
starting point; this is a specific talk, and these rules still hold. Do not
re-propose them.

| Template suggestion | What we do instead |
|---|---|
| Cascadia Mono on titles and code | Fira Code + Fragment Mono + Excalifont. The hand layer is the speaker's identity and it does not switch fonts. |
| Code on a light card, GitHub Light on `#FFFFFF` | The transparent code box with `custom-dark`, which was chosen and tuned by hand. The template itself allows Monokai for anyone who wants dark. |
| Off-white `#E8F4BA` on body | `#fafafa` / `#eaeaea` (see section 2). |
| Violet `#BF2EB2` as second color | Teal `#57c1d4`. The lime-plus-teal pair is the **dlt** brand; the violet is the event's. |
| Filled card `#242424` | No filled cards: elevation is border and whitespace. |
| "Highlight" panel and lime discs with black text | No brand fill on panels; lime lives on drawn elements. |
| One idea per slide, 3 to 5 bullets | Does not apply: the format is diagram plus annotation. |

One template rule was already ours and is worth recording: **lime as text
color only on a dark background**. `#B7FF06` on `#fafafa` gives 1.16:1.

Drawn arrows use `<symbol id="hf-arr">`. Reuse it, do not redraw it.

---

## 6. Wordmark rule

Every mention of the `dlt` tool, in prose or in code, uses the brand spelling.
In prose it is `<span class="brand">dlt</span>`, Fragment Mono in lime. In code
and in `.mono` chips it is `<span class="brand-code">dlt</span>`, lime only,
keeping Fira Code so alignment does not break. `dltHub` as a headline joins
`<span class="brand">dlt</span>` and `<span class="brand-hub">Hub</span>`: lime
for the tool, teal for the company.

Paths (`.dlt/secrets.toml`), system columns (`_dlt_parent_id`) and URLs
(`dlthub.com`) get no treatment.

---

## 7. Layout and motion

Canvas 1920×1080. `.slide-inner` uses padding `100px 140px 120px`; per-scene
exceptions adjust only what they need to.

No header and no eyebrow: the headline opens the slide. The cover is the one
exception — the event lockup sits above the headline, centred. Every scene runs
10s.

Entrance is `data-anim`. `fireEntrance` in `deck.js` runs `gsap.fromTo` from
`{opacity: 0, y: 28}` to `{opacity: 1, y: 0}`, 0.4s, stagger 0.07, once per
activation. `fromTo` and not `from`: `from` records the end value by reading
the current one, and a second activation before the first tick would leave the
element displaced forever.

Bespoke choreography lives in each slide's `fire()`, in `compositions/NN.html`,
and always kills previous tweens with `gsap.killTweensOf` before redoing them.
Never animate the same element in both `data-anim` and `fire()`. No loops, no
parallax, no perpetual motion.

Arrows have a single tip design across the whole deck: a chevron 17px deep by
±10px wide, stroke 4. The `deck.js` helpers (`hwConnector`, `hwFlowArrow`,
`hwArrowDown`, `hwArrowDownRight`) and the hand-drawn tips in `21.html` fit it,
and the constants `HW_HEAD_DEPTH` and `HW_HEAD_HALF` are the source. The dash
pattern varies on purpose (solid for a stable connection, `8 12` for data in
motion) and is not standardized. The exception is the filled tip of the whoami
timeline, which terminates the bar instead of marking flow.

**Box-to-arrow clearance.** Every box-arrow pair in the deck is separated by
`HW_ARROW_GAP` (6px), the clearance from the `dlt.pipeline` slide. The rule is
geometric: the arrow tip stops 6px short of the box edge. Where the arrow is a
flex sibling, the stroke insets by that amount
(`HW_ARROW_GAP → aw - HW_ARROW_GAP`) and the container keeps no gap and no
margin. Where it connects two positioned boxes (the anatomy, the `.pmap-conn`),
the interval is measured in `prep` and the arrow occupies exactly
`box+6 → box-6`. It does not apply to a caption icon (the `.hub-arrow` of
dltHub) nor to the orthogonal branch on the closing slide: there is no box-arrow
pair there.

---

## 8. Change checklist

1. Only tokens from sections 2 and 3? A new color or font means updating this
   file.
2. Is brand color sitting on an Excalifont or sloppy element?
3. Does every mention of `dlt` use `.brand` or `.brand-code`?
4. No filled cards, shadows, gradients or emoji?
5. Radius matching the surface (5 chrome, 10 drawn, 3 chip)?
6. Chrome still monochrome?
7. Entrance using `data-anim` or `fire()`, never both on the same element?
8. Event identity piece entering as-is, `position: absolute`, undistorted,
   unrecolorized and without effects (rotation, shadow, blur)?

---

## 9. Validation

```bash
cd slides
npm run dev      # presents at http://localhost:3004
npm run lint
npm run check
```

The gate is walking the deck with the arrow keys: it has to get through all 23
slides. `check` runs lint, layout, motion and WCAG AA contrast.
