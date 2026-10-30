# Tiny Delivery Club / Klub Kurir Kecil — Monster Adventure

**Play:** https://dolilod.github.io/tiny-delivery-club/

A static, local three.js toy-diorama delivery game. Six 12×12 routes, optional treasure, friendly-spooky monsters and a Cloud King finale. No build step, backend, accounts, tracking, runtime AI or external game resources.

## Play locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open http://127.0.0.1:8000. Choose **Santai / Relaxed** or **Petualangan / Adventure**, then Start.

1. Collect every star-marked parcel, then return to the clubhouse.
2. Explore branching paths and far-corner nooks for optional teal gems. The HUD and result card show your count.
3. Touch a striped flag to activate a safe checkpoint. Bumps preserve parcels and gems and return you there.
4. Collect red-and-gold lanterns. A glow rests nearby monsters for three seconds. You start with one charge; carry at most three.
5. Blue puddles slow movement without costing hearts. Walls block movement and the ghost's sight.

| Action | Keyboard | Phone / pointer |
|---|---|---|
| Move | Arrows or WASD; newest held direction wins | Hold a D-pad direction |
| Lantern glow | Space or E | Kilau / Glow button |
| Pause / resume | Escape | Jeda / Pause button |
| Language, sound, mode | Settings buttons | Settings buttons |

Lantern glow has a half-second cooldown. Touch controls capture the pointer; release, cancellation, lost capture and app switching clear movement. Resize/rotation and page hiding pause play. ID/EN, mute and progress survive language changes. Audio starts only after a gesture; unavailable audio never blocks play.

## Monsters and recovery

- **Mint slime:** slow back-and-forth patrol, visible squash and blink.
- **Lavender ghost:** patrols, shows **!** and a quiet boo before a short chase. Hide behind walls or move away. It gives up and follows a cached, wall-safe route home.
- **Winged pumpkin:** faster, predictable rectangular loop with flapping wings.

Adventure contact removes one of three hearts, returns you to the checkpoint and grants 1.5 seconds of blinking protection. No repeated loss during protection. Zero hearts shows a gentle Retry card; Retry restarts the same route with full hearts and fresh collectibles.

Santai monsters are half speed, never chase and never remove hearts. Safe flag clearings and the level start prevent contact damage. Route four retains its DEFAULT house rule: each new parcel gives both clouds and monsters a two-second nap. Pause freezes the nap and other game timers.

## Cloud King finale

Collect three lullaby parcels. The crowned Cloud King warns, sends an expanding golden ring, then becomes dizzy and shows **zzz**. Touch an unused glowing bell during a rest to deliver one parcel. Each delivery has sparkles and a ding; the friendly bar counts remaining deliveries.

After three distinct bell deliveries, the King sleeps happily. Return to the clubhouse: the King joins the party beside the house. Next advances routes; Replay on the final result returns to route one and mode selection.

Santai has harmless rings and 12-second rests. Adventure rings can cost one heart and rests last seven seconds. Flag clearings remain safe.

## Edit together

`docs/content.js` is the editable source for maps, names, ID/EN strings, palette, rules, monster stats per mode, camera and boss timings. DEFAULT choices remain awaiting the son's actual choices; no child authorship is claimed. Map coordinates are zero-based `[x,y]`; tile centers are rendered at `[x+0.5,y+0.5]`.

Ten minutes: draw a 12×12 route together (2 minutes), invent the courier and mission (3), move one wall or parcel (2), play and choose one change (3). Keep all objectives, checkpoints, lanterns, gems and patrol routes on open reachable tiles. Run `npm test` after edits.

## Verify and assets

`npm test` uses project-local playwright-core and system `/usr/bin/chromium`. It serves only local files beneath `/tiny-delivery/`, checks the campaign and mechanics, real keyboard/pointer/emulated-touch input, lifecycle, bilingual UI/audio, WebGL, failed-model fallbacks, reachability, GLB/vendor hashes and the **<4 MB total docs/** budget. Deterministic helpers exist only with `?test=1`. See TEST_REPORT.md for the exercised check count, measurements and limits.

Ignored `test-artifacts/` contains results, monster/boss screenshots at 390×844 and 1280×800, a friendly-ending screenshot, geometry/download counts and warmed 4× CPU-throttled phone-viewport measurements. These are Chromium emulation/software-GPU results, not physical-iPhone evidence.

All new monsters, flags, gems, lanterns, puddles, bells and the boss are **original work for this project**, authored procedurally in `docs/scene.js`. No new third-party models or image textures were downloaded. Scenario's existing robot/chest/cottage/tree GLBs remain credited as CC BY 4.0 on Credits and in ASSET_MANIFEST.md; all four have playable procedural fallbacks. Existing model bytes total 1,738,924. three.js 0.187.0 is vendored locally under MIT.

The renderer uses a shake-free smooth follow camera, nearby-boss framing, instanced tiles/hedges/path markers, shared toy geometry/materials, one 1024 shadow light, DPR capped at 1.5 and finite particle pools. Paused and settled result scenes stop drawing. Software-GPU performance is slow; actual Safari smoothness remains unverified.

## Physical iPhone and Pages — NOT RUN

For a physical iPhone on trusted home Wi-Fi only:

```sh
python3 -m http.server 8000 --bind 0.0.0.0 --directory docs
```

Open `http://LAPTOP-LAN-IP:8000` in Safari. Serve only docs/ and stop the server afterward. Follow the explicit input, rotation, audio, monster and boss checks in TEST_REPORT.md.

Live on GitHub Pages (main → /docs): https://dolilod.github.io/tiny-delivery-club/ . Run the live-host manual checks in TEST_REPORT.md on a physical iPhone. GitHub may log IP addresses for hosting security. No service worker or offline installation is included. Milestone 8 remains excluded.

## Credits and licenses

- **3D models** (robot courier, treasure chest, cottage, tree): created by **Scenario**, from the [Scenario 3D collection](https://huggingface.co/datasets/scenario-labs/3d-collection), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Optimized (deduplicated, welded, simplified, textures resized to ≤512 px) for this project; no endorsement implied. Exact IDs, prompts, source URLs and hashes: `ASSET_MANIFEST.md`, license text: `docs/licenses/SCENARIO-CC-BY-4.0.txt`, and the in-game Credits page.
- **three.js 0.187.0**: © three.js authors, [MIT License](https://github.com/mrdoob/three.js/blob/dev/LICENSE), vendored in `docs/vendor/three/`; license text in `docs/licenses/THREE-LICENSE.txt`.
- **Planning reference**: [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) by Abhishek Barali and contributors, Apache License 2.0. No skill files were installed, copied or redistributed in this project.
- Monsters, flags, gems, lanterns, puddles, bells, the Cloud King, effects and sounds are original code-native work for this project.
- Project direction: Doli. Coding assistance: OpenAI Codex.
