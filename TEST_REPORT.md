# Test report — Monster Adventure

## Final automated verification

**PASS — `npm test`: 40 checks, 0 failures**, using project-local playwright-core and system Chromium. All 29 existing check IDs remain green; 11 monster/touch/visual behavior checks were added. Static files are served beneath `/tiny-delivery/` with non-local requests blocked. Runtime remains local three.js 0.187.0.

| Scope | State | Exercised evidence |
|---|---|---|
| Six-route campaign | PASS | All six 12×12 routes, guarded Next, Retry, final Replay and boss clubhouse ending. Targeted teleports collect objectives; boss phase controls exercise the intended bell deliveries. |
| Content / BFS | PASS | Every parcel, gem, lantern, checkpoint, puddle, bell and exit lies on a legal reachable tile. Every patrol segment, including the pumpkin loop closure, joins adjacent open tiles. |
| Monster AI | PASS | All three types spawn and move; ghost warns, approaches, loses interest at range and resumes patrol. A reproduced hedge-corner return failure now follows a cached BFS path home; regression passes. |
| Contact / checkpoints | PASS | Adventure loses exactly one heart, preserves pickups, returns to last flag and grants immunity. Repeated protected contact does not lose hearts. Zero hearts shows gentle Retry. Santai never chases or loses hearts. Safe flag clearing blocks the boss ring after immunity expires. |
| Lantern / collectibles / puddles | PASS | Space, E, on-screen click and real emulated touch activate stun; nearby monsters stop for the configured duration and resume. Pause preserves timers. Lantern charges refill, gems count once, survive bumps and appear on results; puddles slow movement. |
| Boss | PASS | Reachable through campaign; warning → wave → dizzy advances. No delivery without a parcel; only distinct bells count. Three deliveries sleep/befriend the King, visible bar reaches zero, clubhouse return wins, and King appears beside the house. Adventure wave costs one heart; pause freezes boss state. |
| Input / lifecycle | PASS | Real keyboard, pointer capture, release outside, cancellation, lost capture, blur, visibility loss, resize and rotation. Separate touch-enabled Chromium context uses native CDP touch start/end/cancel plus lantern tap. This is emulation, not iPhone testing. |
| ID/EN / audio / mute | PASS | Language switches preserve progress and fit layouts. Web Audio is gesture-only; oscillator probes observe pickup, bump, celebration, boo, sparkle, checkpoint, gem and boss notes. Mute prevents new notes; injected audio failure does not block winning. |
| Visual / layout | PASS | Nonblank WebGL and 4/4 GLBs at 390×844 and 1280×800; 844×390 rotation regressions. Desktop canvas 1030×636 = 63.97% of viewport area. HUD, buttons and footer fit. Required monster/boss screenshots and friendly ending opened and inspected. |
| Assets / integrity | PASS | All shipped GLB and vendored JS hashes match ASSET_MANIFEST.md; GLB buffers/images embedded; textures ≤1024 px. Four corrupt-model fixtures exercise every procedural fallback and still permit delivery. Visible original-work and Scenario credits verified in ID/EN. |
| Download budget | PASS | **2,753,508 bytes total docs/**, below 4,000,000; existing GLBs total 1,738,924 bytes. New assets add no binary model/image/audio files. Procedural source and per-instance triangles recorded in ASSET_MANIFEST.md. |
| Runtime isolation | PASS | Zero collected console errors, pageerrors, missing-resource errors or non-local runtime requests across gameplay, touch, visuals, fallbacks and performance checks. Normal pages expose no test helpers. |

`?test=1` enables teleport, level selection, freeze/step monster AI, freeze/step boss and force non-winning boss phases. Authored maps and motion are deterministic; no random seed is needed. Helpers do not exist in normal play. Tests use real input for movement/touch and helpers for targeted collisions, campaign traversal and boss windows; this is not a claim of an unaided child playthrough.

The managed browser helper could not launch/connect to system Chromium. Actual UI verification used project-local Playwright with `/usr/bin/chromium`, not a simulated rendering assertion.

## Performance — software GPU, not physical iPhone

Method: headless Chromium; 390×844 CSS viewport; browser DPR 2; renderer ratio capped at 1.5; 4× CPU throttle; 1.5-second warm-up after entering each scene; at least eight seconds of actual rendered frames. Santai simulation and monsters remain live. The route-four courier stands at (7.5,7.5), near all three monster types; boss sample stands at (6.5,7.5). Draw calls include shadow rendering. One 1024×1024 shadow light is retained.

Renderer: ANGLE / Vulkan SwiftShader Device (Subzero), a software GPU.

| Final scene | Sample seconds | Rendered frames | Average FPS | Average draw calls | Draw-call range | Reported triangles |
|---|---:|---:|---:|---:|---|---:|
| Route 4, monsters nearby | 8.1273 | 62 | 7.63 | 136.00 | 136–136 | 85,728 |
| Route 6, Cloud King arena | 8.0234 | 67 | 8.35 | 122.99 | 122–125 | 72,101 |

**These software-rendered results are slow and do not establish smooth iPhone performance.** The brief requests measurement, not a minimum FPS threshold. The older 3D result sampled the courier at the route start; the new, busier framing is not a controlled same-scene FPS comparison. Host load also affects results.

Instanced ground, hedges and patrol dots reduce repeated submissions. Lower-segment rounded ground retains the toy silhouette. Geometry/materials are shared; particles use a fixed pool. Paused and settled-result scenes stop drawing. Actual Safari performance remains a release gate.

## Evidence

All paths below are ignored local `test-artifacts/` files, not committed:

- `results.json`: 40 PASS results.
- `monsters-390x844.png`, `monsters-1280x800.png`: all three monster silhouettes and full controls.
- `boss-390x844.png`, `boss-1280x800.png`: crowned King, zzz, bells and health/delivery bar.
- `monster-friendly-ending.png`: sleeping King beside the clubhouse, final result and gem count.
- `monster-lantern.png`: all three monsters show zzz and one charge has been consumed.
- `monster-checkpoint.png`: last-flag respawn, 2/3 hearts, protection and retained gem.
- `monsters-performance.json`, `boss-performance.json`, corresponding PNGs: final warmed measurements.
- `monster-budget.json`, `monster-geometry.json`: exact distribution/model bytes and generated triangle counts.
- Existing `3d-*` and milestone screenshots: original regression evidence, including model fallbacks and nap/pause/celebration.

The storyboard comparison, phone boss-framing correction, concrete ghost-return reproduction and inline release review are in DECISIONS.md. Existing GLBs were unchanged; this update checked their hashes/loading/fallbacks, not a new glTF validator run. The prior cottage tangent-space warnings remain a physical-Safari inspection item.

## Manual checks — NOT RUN

| Check | State | Exact manual steps |
|---|---|---|
| Physical iPhone Safari / performance | NOT RUN | Device unavailable. On trusted home Wi-Fi, serve only docs/ with `python3 -m http.server 8000 --bind 0.0.0.0 --directory docs`. Open `http://LAPTOP-LAN-IP:8000` in Safari. Play all six Santai routes using D-pad and Glow; collect gems, activate flags, walk puddles, stun each monster, deliver three lullaby parcels during rests and return to the clubhouse. Record device, iOS version, smoothness and thermal/stutter behavior. Stop the server afterward. |
| Physical iPhone input / lifecycle | NOT RUN | Hold a direction, slide outside and release: courier stops. Cancel a touch and app-switch while holding: return paused at the same position. Resume requires a new press. Rotate during play, Retry and final result; check Safari chrome expanded/collapsed, safe areas and pinch zoom outside D-pad. |
| Physical Adventure / Retry / audio | NOT RUN | Take three separated monster bumps, check flag respawn/immunity and Retry. Dodge the boss ring; stand in a flag clearing and verify safety. Test Space/E with a hardware keyboard if available, plus Glow taps. Check ID/EN and mute; inspect cottage rendering for prior tangent-space portability warnings. |
| Headphone / speaker listening | NOT RUN | Oscillator generation and low gains are verified, but no human listening assessment was performed. At a comfortable volume, check boo, sparkle, oops, ding and boss stinger; confirm no startling peak and immediate mute. |
| Child-authored choices / playtest | NOT RUN | No drawing, names or actual creative choices supplied. Keep DEFAULT labels. Draw a 12×12 route together, compare choices to content.js, then observe an unaided child playthrough before claiming child authorship or age-tested difficulty. |
| Actual GitHub Pages URL | NOT RUN | Publishing excluded; no live URL exists. After Doli separately publishes main /docs, cold-open the exact repository-subpath URL. Verify local modules/assets/licenses, complete all six routes, repeat boss, touch, audio, app-switch and rotation checks on the physical iPhone. |

No push, repository creation, publishing, global installs/configuration changes, credentials, tracking, accounts, new external models or paid image/model APIs were used. Historical milestones remain in STATUS.md and RUN.log; they are not current physical-device evidence.
