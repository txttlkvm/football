# Finish the Tackle · Coach Lab

An interactive portfolio course for youth football coaches, refined from the supplied Canva HTML rather than replacing its content and interactions wholesale.

Open **index.html** from a web server or import this repository into Canva. The editable source references the transparent PNG files in `assets/artwork/` with relative paths, so the code and images stay together. To preview locally:

```bash
cd /workspace/football
python -m http.server 8000 --bind 0.0.0.0
```

The course uses a fixed 16:9 presentation stage. Its desktop workflow was visually and functionally validated in Chromium at 1440×810 and 1365×768. Portrait phone layouts and other browser engines have not been validated.

## Course architecture

22 slides: introduction, ten alternating TEACH/TRY pairs, and completion.

| Pair | Teaching focus | Learner action |
| --- | --- | --- |
| 1 | Pursuit angle / near hip | Select a pursuit path and see its consequence |
| 2 | Low, balanced breakdown | Compare and select body positions |
| 3 | Eyes / visual connection | Choose one correction and replay |
| 4 | Track → break down → fit → wrap → drive | Reorder the five actions with accessible arrow buttons |
| 5 | Earliest visible failure | Diagnose five freeze-frames, including feet |
| 6 | Completed finish over highlight hit | Compare two finishes and reinforce one |
| 7 | Continuous feet through contact | Diagnose stopped feet and choose a correction |
| 8 | One correction, another rep | Choose a priority cue for three different players |
| 9 | Evidence sets practice emphasis | Interpret simulated KPI data and select a drill |
| 10 | Integrate leverage, diagnosis, feedback, progression | Make three Game-Day Finish decisions |

Completion reports the score, successful coaching cues, practice priority, completed challenges, and key takeaway. Navigation remains available so coaches can revisit the teaching. Skipping activities produces an explicitly incomplete scorecard.

## Scoring and retries

The original single-award scoring behavior is preserved and normalized to 100 points: ten points per pair. Diagnosis awards two points per freeze-frame; three-decision activities award 3 + 3 + 4. Incorrect choices award no points and can be corrected immediately. Replaying or retrying does not award the same points twice. Restart clears every activity, all points, chosen cues, and the priority. Progress and slide totals derive from the actual slide array. State is held for the current session and resets on page reload.

## Artwork and safety

`assets/artwork/` contains 14 original, AI-generated transparent PNGs with realistic youth proportions, fitted equipment, textured uniforms, and dimensional lighting. The blue defender and coral runner remain identifiable across the poses. Fit, wrap, drive, and stopped-feet scenes use coordinated two-player compositions so contact stays aligned. Separate number 3 and number 9 assets preserve the Coach the Rep activity. These are rendered character images, not a real-time 3D engine.

`assets/players.js` maps the existing activity poses to these assets. Its retained `playerSVG()` factory now returns accessible images, preserving the activity hooks. The standalone HTML embeds all artwork; the ZIP includes the original PNGs and editable source. Movement respects `prefers-reduced-motion`.

This is a simulated portfolio project. The KPI scenario represents six linebackers, 60 attempts, and 30 baseline misses (50%). A one-third reduction means 20 misses across the same 60 attempts (about 33%). Breakdown counts are angle 12, level 7, eyes 4, wrap 4, and feet 3. The learner must act on the data, choosing predetermined-lane tracking to address angle/leverage first.

Detailed contact/head technique belongs to the coach's league-approved current certified tackling and safety program. The course retains that guidance and focuses on coaching logic and controlled progressions.

## Files and validation

- `index.html`: editable course content and the retained navigation/DOM hooks.
- `assets/base.css`: retained visual foundation and palette.
- `assets/course.css`: fixed-stage layouts, reserved feedback, refined diagrams and motion.
- `assets/utilities.css`: locally compiled utility CSS; no CDN runtime dependency.
- `assets/course.js`: retained original state, sequence/scenario data, and navigation.
- `assets/enhancements.js`: upgraded activity renderers, feedback, retries, and scorecard.
- `assets/players.js`: rendered artwork manifest and compatible player/scene factories.
- `assets/artwork/`: 14 transparent player and contact compositions.
- `finish-the-tackle.html`: portable single-file version.
- `finish-the-tackle.zip`: HTML and editable source assets, README, and audit.
- `qa/before/`: unmodified supplied source, initial screenshots, and interaction audit.
- `qa/after/`: every final slide, all ten wrong/correct feedback screenshots, contact sheet, smaller-viewport screenshots, and `verification.json`.
- `qa/artwork/`: actual-size rendered-art screenshots, provenance, adversarial review, and artwork/package verification.
- `tools/verify_course.py`: Playwright browser validation using real buttons for all activity choices and sequence ordering.
- `tools/verify_artwork.py`: image loading, alpha, accessibility, pose changes, geometry, and offline source/standalone checks.
- `tools/package_course.py`: rebuild the portable HTML and ZIP after edits.
- `tools/verify_package.py`: render the bundled HTML with networking disabled and test offline navigation, restart, and KPI choices.

Run `python tools/verify_course.py` while the static server is running on port 8000. Run `python tools/package_course.py` after source edits, then `python tools/verify_package.py` and `python tools/verify_artwork.py --source-url http://127.0.0.1:8000/`. The verification tools require Python Playwright and Pillow (available in this workspace) plus `/usr/bin/chromium`; the course itself has no such dependency. Utility CSS is already built, so existing styles need no build step. If introducing new utility classes, compile them using Tailwind CSS 3.4.17 or write styles in `course.css`.
