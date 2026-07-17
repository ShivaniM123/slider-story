# Web Story 

An interactive, full-screen-style story viewer for AEM Edge Delivery Services. Each story is a vertical 9:16 carousel of slides with autoplay, progress bars.

## Features

- **Autoplay** — advances every 6 seconds with animated progress bars
- **Tap navigation** — tap right two-thirds to go forward, left third to go back; press-and-hold to pause
- **Keyboard** — `ArrowLeft` / `ArrowRight` to navigate
- **Pause / play** — top-right control stops and resumes autoplay
- **Share** — uses the Web Share API, or copies the page URL to the clipboard
- **Prev / next arrows** — sit outside the story card in the gutter; previous is disabled on slide 1
- **Replay** — the next arrow becomes a replay button on the last slide
- **Visibility pause** — autoplay pauses when the block scrolls out of view

## File structure

```
blocks/web-story/
├── web-story.js      # Block decoration and interaction logic
├── web-story.css     # Layout, typography, and control styling
└── README.md

icons/
├── nav-prev.svg      # Previous slide arrow
├── nav-next.svg      # Next slide arrow
├── replay.svg        # Replay (last slide)
├── pause.svg         # Pause control
├── play.svg          # Play control (shown when paused)
└── share.svg         # Share control (AMP story icon)
```

## Content model

The block expects one **row per slide**. Each row has two cells:

1. **Image cell** — full-bleed background (`picture` or `img`)
2. **Text cell** — caption overlay at the bottom

## Customization

Override CSS custom properties on `.web-story`:

| Variable                      | Default              | Description                          |
|-------------------------------|----------------------|--------------------------------------|
| `--web-story-accent`          | `rgb(240 43 103)`    | Caption background / link color      |
| `--web-story-aspect`          | `9 / 16`             | Story card aspect ratio              |
| `--web-story-control-icon-size` | `48px`             | Pause, play, and share icon size     |

Example:

```css
.web-story {
  --web-story-accent: rgb(200 30 80);
  --web-story-control-icon-size: 40px;
}
```

The viewer max-width is `360px` ( `380px` at `≥600px` viewport width).

## Behavior notes

- **Autoplay duration** is set by `AUTOPLAY_MS` (6000) in `web-story.js`.
- **Manual pause** takes priority over press-and-hold pause and scroll-into-view resume.
- **Share fallback** — if `navigator.share` is unavailable, the URL is copied and a “Link copied” tooltip appears.
- **No loop by default** — autoplay stops on the last slide; users replay via the next-arrow replay state or tap.

## Fonts

Caption styles reference **Oswald**, **Roboto**, and **Cookie**. Ensure these are loaded site-wide (for example via Google Fonts in `head.html` or `styles/fonts.css`) for the intended look.

## Local development

From the project root:

```sh
npm i
aem up
```

Add a page with a `web-story` block and open it at `http://localhost:3000/<your-page>`.

## Accessibility

- The block is exposed as `role="region"` with `aria-roledescription="Web Story"`.
- Controls have `aria-label` attributes (`Previous slide`, `Next slide`, `Pause story`, `Share story`, etc.).
- Inactive slides are marked `aria-hidden="true"`.
