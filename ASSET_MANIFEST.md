# Asset manifest

## three.js 0.187.0 — MIT

Latest stable version returned by the npm registry during this rebuild. Source archive: https://registry.npmjs.org/three/-/three-0.187.0.tgz . License: docs/licenses/THREE-LICENSE.txt.

The registry archive does not contain minified builds. Its build/three.module.js and build/three.core.js were minified with project-local esbuild 0.28.2, without bundling or semantic edits. The module keeps its relative ./three.core.js import. Addons are unchanged from that archive.

| Local file (beneath docs/vendor/three/) | Source archive path | SHA-256 |
|---|---|---|
| three.module.min.js | build/three.module.js | 421d3269659f1aaaeb3d49974373f896c9287b05948635ae9b286f100e4e5ac3 |
| three.core.js | build/three.core.js | 04750c60541ce68acf84ea72bdaea4b2dc7696b0501d36faeaa9d1d0cc63ba78 |
| addons/loaders/GLTFLoader.js | examples/jsm/loaders/GLTFLoader.js | 532ac726e120039acbcd6cf54328c57acbf7b438176afaa6951257126d11bff1 |
| addons/utils/BufferGeometryUtils.js | examples/jsm/utils/BufferGeometryUtils.js | 7bda2a8ba836b2bcf67cb938d4b9e1bb5d1b1bc616817103ed858c0b58296ce7 |
| addons/geometries/RoundedBoxGeometry.js | examples/jsm/geometries/RoundedBoxGeometry.js | c5feab96123858ed8823c889b238dc8734adab7e760e3cfd21e7f3f2f3e348e3 |
| addons/utils/SkeletonUtils.js | examples/jsm/utils/SkeletonUtils.js | b1632a703206c3d830de9fcbe515696770d04b71a15ee6b50afa6d2c3298c86f |

## Code-native assets

Rounded tiles, hedges, procedural fallback courier/parcel/house, clouds and effects are made in code. Audio is synthesized with Web Audio after a gesture. No fonts, recorded audio, analytics, accounts or runtime CDN resources.

## Scenario — CC BY 4.0

Dataset: https://huggingface.co/datasets/scenario-labs/3d-collection . Creator attribution: **Scenario**. License: https://creativecommons.org/licenses/by/4.0/ . Dataset LICENSE text is preserved verbatim in docs/licenses/SCENARIO-CC-BY-4.0.txt. No endorsement implied.

Selection used the datasets-server train metadata (all 1,342 rows) and HF repository file sizes. Only these four GLBs were downloaded; originals remain in ignored tools/downloads/. No cloud model suited the simple readable hazard: clouds are procedural.

| Role / local file | Exact ID | Exact prompt | Original bytes | Exact source file URL |
|---|---|---|---|---|
| Courier / docs/assets/courier.glb | scenario:asset_VTLjiPwXDDUaQYPENSAeCR5y | a cute rounded cartoon toy robot, glossy teal and yellow plastic | 981824 | https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_VTLjiPwXDDUaQYPENSAeCR5y/output.glb |
| Parcel / docs/assets/parcel.glb | scenario:asset_REqrcdST88BnqrUqbz4WehU2 | A red cartoon-style treasure chest with a white handle and a blue gem on the front. | 1511760 | https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_REqrcdST88BnqrUqbz4WehU2/output.glb |
| Clubhouse / docs/assets/house.glb | cb0713880a588398 | Recreate this cottage. | 2823480 | https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/cb0713880a588398/1c385e4afcbd63db.glb |
| Prop / docs/assets/tree.glb | scenario:asset_oVt4mfv8pdyuwzkmjEDNc3MS | low poly tree | 69420 | https://huggingface.co/datasets/scenario-labs/3d-collection/resolve/main/assets/scenario_asset_oVt4mfv8pdyuwzkmjEDNc3MS/output.glb |

Changes for **each** model: project-local glTF Transform 4.5.1 optimize with deduplication, weld, flatten/join, pruning, texture resizing to ≤512 px and simplification (0.01 error, 0.1 target ratio; tree 0.002 error / 0.7 ratio). Existing low-poly tree topology was retained when simplification could not reduce it. No meshopt/Draco/KTX decoder is required. Runtime normalizes scale and bottom-center origin; original colors retained. Each failed model uses the corresponding procedural toy fallback. Visible Credits reproduces each exact ID, prompt, URL, Scenario attribution, CC BY 4.0 link and change notice.

Phaser and its obsolete licenses were removed after the renderer cutover.

| Optimized file | Bytes | Triangles | SHA-256 |
|---|---:|---:|---|
| courier.glb | 145084 | 4234 | 8d4c224a98b2ecd4c65fb9213f02f478890f2b42a24a4aa30e9727867c0aecf7 |
| parcel.glb | 514980 | 1694 | acb25cc76dc8bd8c567d9162eae864d86b2b6611718c86a8dc472cde70c6ece2 |
| house.glb | 1009504 | 8652 | e9277394ee40deda24e762955ff4d97ca54dc459fe457b3dfe14612e11f63be0 |
| tree.glb | 69356 | 917 | 78e0b55f6cc98f0c075e59a0fa3eaaa6e3197fbe0c2a57b7a03526a6ebdf4fae |

Total docs/assets/: **1,738,924 bytes**. Monster acceptance checks the stricter **<4,000,000 bytes for all docs/**, including models, vendor code, licenses and game source.

## Monster update — original code-native toys

New assets are **original work for this project**, authored directly in `docs/scene.js` using shared three.js geometry. No new GLBs, downloaded models or image textures. The shared scene.js source is **20,972 bytes** (includes the existing renderer); each toy adds **0 separate binary asset-file bytes**. Runtime traversal measured these per-instance triangle counts, including sprite plaques and bell halos, excluding shadow-pass duplication.

| Asset | File / function | Binary asset bytes | Triangles | How authored / animated |
|---|---|---:|---:|---|
| Mint slime | docs/scene.js `monsterToy('slime')` | 0 | 1,010 | Squashed sphere, eyes/pupils, smile; squash, blink and gaze |
| Lavender ghost | docs/scene.js `monsterToy('ghost')` | 0 | 1,514 | Tall sphere and three scalloped lobes; float and warning/sleep plaque |
| Winged pumpkin | docs/scene.js `monsterToy('pumpkin')` | 0 | 1,646 | Orange sphere, stem and rounded wings; flap and rectangular loop |
| Checkpoint flag | docs/scene.js `rebuild` | 0 | 1,200 | Teal safe mat, dark pole, gold flag and white stripe |
| Teal gem | docs/scene.js `rebuild` | 0 | 8 | Spinning octahedron; optional treasure |
| Glow lantern | docs/scene.js `rebuild` | 0 | 768 | Two rounded frame blocks and gold sphere window |
| Puddle | docs/scene.js `rebuild` | 0 | 168 | Flattened blue sphere, non-damaging slow zone |
| Lantern pulse | docs/scene.js `glowRing` | 0 | 288 | Shared torus, finite expansion with no camera shake |
| Cloud King | docs/scene.js `cloudKing` | 0 | 2,246 | Three cloud lobes, eyes, crown blocks and sleepy plaque |
| Lullaby bell | docs/scene.js boss `rebuild` | 0 | 1,224 | Teal pedestal, stand, gold dome, clapper and delivery halo |
| Shockwave | docs/scene.js boss `wave` | 0 | 288 | Shared torus, predictable expansion without spikes |

Monster boo, sparkle, checkpoint, gem and boss cues use low-volume Web Audio oscillators configured in content.js. Recorded audio download bytes: 0.

Geometry evidence: ignored `test-artifacts/monster-geometry.json`. Download-byte evidence: `test-artifacts/monster-budget.json` and TEST_REPORT.md. Repeated ground, hedge and route-marker geometry is instanced. Existing Scenario files, their hashes and attribution remain unchanged; visible Credits separately identifies all new original work in ID/EN.
