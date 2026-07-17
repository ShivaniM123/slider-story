# Web Story 

An interactive, full-screen-style story viewer for AEM Edge Delivery Services. Stories play through a sequence of slides with autoplay, progress bars, and playback controls

Url: https://story--slider-story--shivanim123.aem.page/story

## Features

**1. Autoplay & progress**

- Slides advance automatically every 6 seconds.
- Segmented progress bars at the top show story position and fill as each slide plays.
- Autoplay pauses when the block scrolls out of view and resumes when it returns.

**2. Navigation**

- Prev / next arrows sit outside the story card in the gutter.
- Previous is disabled on the first slide; next becomes a replay control on the last slide.
- Tap the left third of the story to go back, or the right two-thirds to advance.
- Press-and-hold pauses until release.
- Keyboard: `ArrowLeft` / `ArrowRight`.

**3. Playback controls**

- Pause / play button in the top-right stops and resumes autoplay.
- Manual pause takes priority over press-and-hold and scroll-into-view resume.

**4. Share**

- Uses the Web Share API when available.
- Falls back to copying the page URL to the clipboard with a “Link copied” tooltip.

## File Overview

```
blocks/web-story/
├── web-story.js      # Block logic — slides, autoplay, navigation, share, pause
├── web-story.css     # Layout, caption styling, progress bars, control icons
└── README.md         # This documentation

icons/
├── nav-prev.svg      # Previous slide arrow
├── nav-next.svg      # Next slide arrow
├── replay.svg        # Replay control (last slide)
├── pause.svg         # Pause control
├── play.svg          # Play control (shown when paused)
└── share.svg         # Share control
```

## Workflow

| Step | What happens |
| --- | --- |
| **`web-story.js` (`decorate()`)** | Block entry point — EDS calls this to initialize the component |
| **Parse rows** | Each authored row becomes one slide (image cell + caption cell) |
| **Build UI** | Creates the viewer, progress bars, pause/play, share, and prev/next controls |
| **Wire up events** | Attaches handlers for arrows, tap zones, keyboard, pause, and share |
| **Start autoplay** | Shows slide 1 and begins the progress animation and slide timer |
| **Web Story ready** | Story is interactive — users can navigate, pause, and share |

**Capabilities:** autoplay · progress bars · tap zones · press-and-hold pause · pause/play · share · replay · keyboard nav · scroll-into-view pause · responsive layout

## How to Use

1. Copy the `blocks/web-story` directory and the `icons/` assets (`nav-prev.svg`, `nav-next.svg`, `replay.svg`, `pause.svg`, `play.svg`, `share.svg`) into your EDS project.

2. **Authoring in Document Authoring (DA)**

   Each row in the block is one slide with two cells:

   | Cell | Content |
   | --- | --- |
   | **Cell 1** | Slide image (`picture` or `img`) |
   | **Cell 2** | Caption text (`h1`–`h3`, `p`, optional `a`) |


3. Preview and publish the page.

## Points to Note

**Behavior**

- Autoplay stops on the last slide; users replay via the next-arrow replay state or tap.
- Share uses `navigator.share` when supported; otherwise the URL is copied to the clipboard.

**Accessibility**

- Block is exposed as `role="region"` with `aria-roledescription="Web Story"`.
- Controls have `aria-label` attributes (`Previous slide`, `Next slide`, `Pause story`, `Share story`, etc.).
- Inactive slides are marked `aria-hidden="true"`.

**Local development**

```sh
npm i
aem up
```

Add a page with a `web-story` block and open it at `http://localhost:3000/<your-page>`.
