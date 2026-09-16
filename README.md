# MultiPOV — Synced YouTube Viewer

Watch up to **6 YouTube POVs** at once, kept in sync — built for comparing
side-by-side Mario Kart team-match perspectives.

- One **focused** player in the main view; the other 1–5 as clickable
  miniplayers in the sidebar. Click a miniplayer (or press `1`–`6`) to swap it
  into focus.
- **Audio follows focus** by default; each cell's 🔊 button lets you keep audio
  on a non-focused POV. `0` mutes all.
- **Per-video sync offsets.** Scrub each video to the same shared moment (e.g.
  the race start), click **Set Sync**, and all videos share one master timeline.
- A master-clock loop continuously corrects drift so the feeds stay aligned.
- Requests the highest available quality per feed (YouTube ultimately picks
  based on player size, so the focused feed gets the best resolution).

## Keybinds

| Key | Action |
| --- | --- |
| `Space` | Play / pause all |
| `←` / `→` | Skip ±5s |
| `Shift`+`←`/`→` | Skip ±1s |
| `1`–`6` | Focus that POV (and its audio) |
| `0` | Mute all |
| `R` | Force resync |

## Running

The page must be served over **HTTP** — the YouTube IFrame API does not
initialize from a `file://` origin. Any static server works:

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777.

## How sync works

Each video stores an `offset` = its own timestamp at the shared sync moment.
A single `masterTime` (seconds since the sync point) drives everything: each
video's target position is `offset + masterTime`. The focused video acts as the
clock leader; every tick, followers that drift more than 0.25s are re-seeked.
