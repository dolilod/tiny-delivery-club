# Decision record — 3D rebuild

## Concept storyboard (locked before implementation)

1. **Welcome diorama:** a complete 8×8 mint-and-cream rounded tile island, viewed from a fixed three-quarter camera. A teal toy robot waits at the upper-left spawn. Golden/red parcels and a warm clubhouse remain readable at phone size. Soft daylight and contact shadows make every piece feel like a tabletop toy.
2. **Delivery in motion:** the courier turns and hops along the board, with a small idle bob at rest. A collected parcel pops into a short gold sparkle burst. Hedges remain low enough to read the paths. Clouds drift along marked patrol routes without hiding the courier.
3. **Sleep and celebration:** level-4 pickups dim both clouds and expose floating zzz marks. The board stays still during pause. Delivery triggers a short, colorful clubhouse celebration; HTML status, hearts and buttons remain outside the 3D view.

Video2Game is inspiration for target → implementation → screenshot comparison only. No video generation, external AI calls or unverified repository/license claims.

## Technical choices

- Replace Phaser rendering cleanly with locally vendored three.js 0.187.0 (npm latest stable when queried). Static ES modules; no build/backend/CDN.
- Preserve continuous axis-only movement, collision radius, campaign state and input priority. Rendering adds motion without changing simulation coordinates.
- Keep content.js the only source for maps, names, strings, palettes and rules. Preserve DEFAULT labels; no child authorship is claimed.
- Fixed orthographic three-quarter camera fits the full board, rather than following the courier or introducing camera motion.
- Shared rounded tile geometry with instancing, one 1024 shadow-map directional light, hemisphere fill, capped DPR, bounded frame delta.
- GLBs use simplified collision proxies already defined by game rules. Normalize model bounds/pivots, resize textures and simplify before shipping; procedural toys remain available if loading fails.
- Existing gesture-only synthesized sound, immediate mute, ID/EN, pointer capture/cancel and lifecycle pause remain intact.
- Local commits only. Physical iPhone and live Pages are separate checks, never inferred from Chromium.

## Applied skill guidance

Paths below are relative to the read-only gamedev skill pack at its pinned commit.

- skills/web-engines/threejs-scene-setup/SKILL.md — local import map, WebGL renderer, bounded delta, responsive camera and DPR.
- skills/web-engines/threejs-gltf-loading/SKILL.md — GLTFLoader, asynchronous loading, explicit model bounds and verified load count.
- skills/web-engines/threejs-materials-lighting/SKILL.md — PBR toys, hemisphere fill and one directional light with fitted shadows.
- skills/disciplines/create-game-assets/SKILL.md — coherent silhouette/palette and in-game visual validation, not prompt-only approval.
- skills/disciplines/create-game-assets/references/three-d-pipeline.md — normalized pivots, GLB delivery, bounded textures and separate collision proxies.
- skills/disciplines/game-feel/SKILL.md — short pickup/pop and celebration feedback, independent of simulation.
- skills/disciplines/camera-systems/SKILL.md — whole-board framing and stable camera; no unnecessary follow or shake.
- skills/disciplines/input-systems/SKILL.md — retain shared named directions for keyboard and touch, held-state movement, clear on cancellation.
- skills/disciplines/performance-optimization/SKILL.md — batch repeated tiles, measure warmed frame timing/draw calls under the requested CPU throttle.

## Screenshot comparison against the storyboard

| Frame | Observed evidence | Decision / difference |
|---|---|---|
| 1 — Welcome diorama | 3d-390x844.png and 3d-1280x800.png show the full rounded island, teal robot, star-marked red treasure chests, two trees and clubhouse, with HTML controls outside the canvas | Fixed camera retained. Desktop board height is capped so the board, controls and footer fit 1280×800. The imported cottage is earth-toned rather than coral; a coral porch preserves the delivery target cue. |
| 2 — Delivery in motion | Direct Chromium smoke observed courier yaw following travel, visual hop, pickup particles and smooth cloud movement; 3d-party.png captures the short burst | Simulation coordinates remain authoritative. Particles use one fixed 48-instance pool; pickups never block input. |
| 3 — Sleep / celebration | 3d-cloud-nap.png shows two dim clouds with readable zzz plaques; pause checks confirm stable pose/frame count; win particles expire and static rendering stops | Initial transparent sleep glyphs were too small. High-contrast plaques replaced them after screenshot inspection. |

All screenshot paths above are beneath ignored test-artifacts/. No generated image/video assets or runtime external resources were introduced.

## Measured performance decision

The requested 390×844, 4× CPU-throttled, DPR-2 headless run uses ANGLE/SwiftShader software graphics, not phone hardware. The initial render scale of 2 measured 7.99 FPS at 94 draw calls. Reducing only the render scale cap to 1.5 measured 11.27 FPS in an isolated run and 9.14 FPS in the final full-suite run; host-load variance matters. Keep this conservative cap (below the required maximum of 2); retain the 1024 soft-shadow map and readable models. This software-rendered result is slow and is not proof of smooth phone performance. Final measurements are in TEST_REPORT.md and ignored 3d-performance.json.

## Inline release review

Reviewed simulation/render separation, reset/Retry/Replay effects, asynchronous model replacement, local import dependencies, shared model/geometry lifetime, input cancellation, static rendering and attribution. No additional review agent was launched. Physical Safari remains the compatibility gate, including the cottage's validator warnings about generated tangent space.

## Monster update storyboard

1. **Explore:** a large toy garden with branching paths and treasure nooks. A stable, smooth three-quarter follow camera keeps the courier large; the desktop canvas fills most of the screen.
2. **Encounter:** mint slime, lavender ghost and orange winged pumpkin have distinct silhouettes. A ghost shows an exclamation before chasing. A lantern pulse freezes nearby monsters with visible sleep marks.
3. **Recover:** a striped checkpoint flag marks a safe clearing. A bump flashes the courier, removes one Adventure heart and returns to that flag with protection. Santai never removes hearts.
4. **Finale:** King Grumble Cloud warns, sends a slow expanding ring, then becomes dizzy. Deliver three lullaby parcels to the glowing bells during rests. The cloud sleeps happily and joins the clubhouse party.

## Monster update: applied skill guidance

All paths refer to the read-only game-dev skill pack; no scripts or installers run.

- skills/disciplines/game-ai/SKILL.md — explicit patrol, warn, chase, return and stunned states; separate decisions from movement.
- skills/disciplines/ai-behavior-trees-utility-ai/SKILL.md — choose a small FSM rather than a behavior-tree runtime.
- skills/disciplines/level-design/SKILL.md — safe introduction, optional treasure nooks, rest clearings and a gentle encounter ramp.
- skills/disciplines/create-game-assets/SKILL.md — original rounded toy family, palette and silhouettes verified at game scale.
- skills/disciplines/create-game-assets/references/three-d-pipeline.md — shared geometry/materials, bottom pivots and simple collision circles.
- skills/disciplines/procedural-gen/SKILL.md — deterministic authored map expansion and BFS validation, not random difficulty.
- skills/disciplines/game-feel/SKILL.md — transient squash, blink and sparkles; no camera shake or input-blocking effects.
- skills/disciplines/game-ui-ux/SKILL.md — event-driven bilingual counters and readable touch controls in responsive containers.
- skills/disciplines/camera-systems/SKILL.md — exponential follow smoothing, bounded target and no shake.
- skills/disciplines/input-systems/SKILL.md — edge-triggered lantern action shared by keyboard and touch; preserve cancellation.
- skills/disciplines/physics-tuning/SKILL.md — bounded simulation steps keep movement below collision footprints.
- skills/disciplines/performance-optimization/SKILL.md — instance repeated scenery, reuse geometry, measure warmed software-GPU frames.
- skills/disciplines/audio-design/SKILL.md — gentle synthesized cues through the existing muteable master gain, gesture-only.
- skills/web-engines/threejs-scene-setup/SKILL.md — retain static local modules, resize observer, capped DPR and bounded delta.
- skills/web-engines/threejs-materials-lighting/SKILL.md — coherent rough toy materials and one bounded shadow light.
- skills/web-engines/threejs-gltf-loading/SKILL.md — retain asynchronous local GLBs and complete procedural fallbacks.
- skills/genres/platformer/SKILL.md — use checkpoint recovery and teach-before-test pacing only; no jumping/gravity subsystem.

The existing renderer is three.js, despite the historical Phaser instruction. Preserve the working 3D engine as explicitly required by this update.

## Monster storyboard comparison and final review

| Storyboard frame | Observed evidence | Decision / correction |
|---|---|---|
| Explore | `monsters-390x844.png` and `monsters-1280x800.png`: large nearby tiles, robot, branching hedges, gems, puddles, flag and three distinct monster silhouettes; HUD, lantern and D-pad readable | Keep the shake-free follow camera. Desktop canvas occupies 64% of the viewport; compact header also brings Credits/footer on screen. |
| Encounter / stun | `monster-lantern.png`: all three monsters show zzz and the phone button shows zero remaining charges. Automated Space/E/on-screen and real emulated-touch scenarios confirm stun, expiry, cancellation and charge use | Keep short local effects, a half-second input cooldown and three-second rest. No screen shake, gore or harsh sound. |
| Checkpoint / heart loss | `monster-checkpoint.png`: courier back on the flag, 2/3 hearts, protection label and 1/3 gem retained. Actual contact/loss/Retry and subsequent safe-clearing ring scenarios also pass | Santai has no chase or heart loss. Recovery behavior is verified in the actual simulation, not inferred from artwork. |
| Boss / friendly ending | `boss-390x844.png`, `boss-1280x800.png` and `monster-friendly-ending.png`: crown, zzz, three bells, health/delivery bar and sleeping King beside the clubhouse | First phone inspection found the crown behind the HUD. Nearby-boss framing now includes both King and courier. The King moves beside the house only for the settled celebration. |

All images are beneath ignored test-artifacts/. Required monster and boss screenshots were opened and inspected, not only generated.

Inline review covered state resets, immunity precedence, safe zones, pause/lifecycle timers, mute/audio failure, asynchronous GLB fallbacks, campaign guards, local-only requests and geometry lifetime. A concrete corner chase exposed a ghost stuck on its straight return path: after eight simulated seconds it remained in `return` at approximately (10.24,6.62). A cached BFS route through open tile centers fixes the return; the same chase now resumes patrol. A permanent behavior regression records that sequence. The path is computed once per return, not every frame.

Repeated hedge blocks and cloud path dots now use instancing alongside tiles. Tiles use lower-segment rounded geometry; silhouettes/materials were retained after screenshot inspection. The new performance sample intentionally places the courier near all three monsters, rather than at the old level-four start. It therefore must not be presented as a same-scene FPS comparison with the historical run. Both the monster route and boss arena are measured at 390×844, DPR 2, render cap 1.5 and 4× CPU throttle. Exact final observations are in TEST_REPORT.md; software graphics is not physical-iPhone evidence.

Original creative defaults remain unchanged in authorship status. Expanded maps are stored directly in the original map literals, rather than silently overriding edited goal/parcel coordinates later in the file. New original asset provenance and measured triangle counts are in ASSET_MANIFEST.md and visible bilingual Credits. No external art/model services, downloads, installs, publishing or pushes were used for this update.
