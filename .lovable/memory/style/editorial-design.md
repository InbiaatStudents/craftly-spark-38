---
name: editorial-design-system
description: App UI follows taste-skill — editorial, off-black + warm cream, Instrument Serif + Geist, single accent
type: design
---
App UI design rules (taste-skill applied):
- Backgrounds: warm cream (HSL 36 22% 96%) light / off-black tinted warm (HSL 30 8% 7%) dark. Never pure #000 or #FFF.
- Single accent: warm amber/ochre (HSL 24 62% 48%). No purple-blue AI gradient.
- Display font: Instrument Serif (.font-display). Body: Geist. Mono: Geist Mono.
- Tabular figures via .tabular utility for any numbers.
- Eyebrow labels via .eyebrow (uppercase, tracking-[0.18em], 11px, muted).
- Hairline dividers (.hairline) instead of cards-with-borders for separation.
- Subtle SVG noise overlay applied via body::before at ~3.5% opacity.
- Layouts use 12-col CSS grid; asymmetric (sticky left rail + form column).
- text-wrap: balance on h1/h2, pretty on paragraphs.
- No FloatingShapes / blurred orb component (deleted — was a vibecoded cliché).
