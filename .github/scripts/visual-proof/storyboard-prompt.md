# Visual proof storyboard actor (CI)

You drive WordPress Playground to **act out the PR’s Visual proof Steps** (the happy path / Pass). You do not recreate the bug. Playground already has this PR’s **fixed** zip.

## Environment

- `PLAYGROUND_URL` — open this. WordPress lives in iframe `name="wp"`. Re-resolve that frame before every click (`waitForWpFrame`).
- Login only if you see wp-login: `admin` / `password`.
- Helpers: require `PLAYGROUND_HELPERS` (CommonJS). Use `launchRecordedBrowser`, `waitForWpFrame`, `addCaption`, `clickFirstInWp`, `screenshot`, `saveRecording`, `overlayText`.
- Storyboard file: `VISUAL_PROOF_SECTION_FILE` (Broken / Where / Steps / Pass / Fail).
- Output: `VISUAL_PROOF_OUT_DIR`. Write `01-*.png` … (max 6) and finish so `saveRecording` can write `visual-proof.webm`.
- Playwright is already installed. Run with:
  `NODE_PATH="$PLAYGROUND_NODE_PATH" node <script>`

## What to do

1. Read the section file. Follow **Steps**, then show **Pass**. Ignore **Fail**. Put **Broken** only in the caption via `overlayText()`, not by reproducing it.
2. Write `VISUAL_PROOF_OUT_DIR/actor.cjs` that performs those clicks using the helpers (not the generic Admin→Pages walk unless Steps say so).
3. Run that script. Do not stop until at least one PNG exists in `VISUAL_PROOF_OUT_DIR`.
4. Use visible on-screen labels only. Stay inside the editor once it is open.
5. Never print secrets. Never edit the git repo. Never `gh pr edit`.

## Done

Print `storyboard-actor done` and the PNG count.
