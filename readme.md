# kyrowin bio site ⚡ cyberpunk edition

minimalistic cyberpunk bio card for kyrowin (aka arseniy), 13 y.o. coder from russia.

## features 🌟

- **neon cyberpunk aesthetic** — purple, pink, cyan gradients everywhere
- **particle network background** — 80 animated particles with connecting lines (30 on mobile)
- **glitch effects** — rgb split on title, because why not
- **scanline overlay** — that retro crt vibe
- **terminal-style design** — `$ cat about.txt` and `$ ls skills/`
- **typing animation** — rotating funny dev quotes
- **neon glow effects** — on hover, everything glows like it's 2077
- **no scrolling** — everything on one screen, compact af

## tech stack 💻

- pure html/css/js (no frameworks, no bullshit)
- google fonts: fira code (monospace) + orbitron (headers)
- font awesome icons
- canvas api for particle system
- css animations & gradients

## skills shown 📊

python • aiogram • html • css • javascript • git

## links 🔗

- telegram: [@kyrowin](https://t.me/kyrowin)
- github: [kyrowin](https://github.com/kyrowin)

## usage 🚀

just open `index.html` in your browser and enjoy the neon vibes

```bash
# or serve it locally
python -m http.server 8000
# then open http://localhost:8000
```

## customization ✏️

wanna change colors? edit css variables in `style.css`:

```css
:root {
    --neon-pink: #ff006e;
    --neon-purple: #8338ec;
    --neon-cyan: #00f5ff;
    --neon-blue: #3a86ff;
}
```

wanna change typing texts? edit array in `script.js`:

```js
const texts = [
    'Coder. And nothing else.',
    'your custom text here',
];
```

## performance ⚡

- 60fps animations on desktop
- reduced particle count on mobile
- respects `prefers-reduced-motion`
- gpu-accelerated transforms

## license 📜

do whatever you want, but don't pass it off as your own creation

---

built with `<code/>` and too much tea ☕
fuck the world. (yes. this readme written by claude.ai, lol)
もしもし (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
