# MultiPOV — Synced Multi-Angle Viewer

Watch up to **6 YouTube POVs** at once, kept in sync — built for comparing
side-by-side Mario Kart team-match perspectives. Players are driven through a
common adapter so they share one master clock.

- One **focused** player in the main view; the other 1–5 as clickable
  miniplayers in the sidebar. Click a miniplayer (or press `1`–`6`) to swap it
  into focus.
- **Audio follows focus** by default; each cell's 🔊 button lets you keep audio
  on a non-focused POV. `0` mutes all.
- **Guided Sync Setup.** Click **◎ Sync Setup** to walk through each video one at
  a time — line up the same frame in each (with ±1s / ±0.1s nudge controls),
  capture, and it maps every video onto one shared master timeline.
- **Per-video sync offsets.** Or, for a quick single fix, scrub any video and
  click its **Set Sync** button to align just that feed to the current moment.
- **Shareable links.** The whole setup — videos, sync offsets, display names,
  and which POV is focused — is encoded in the URL and updates as you go. Click
  **⧉ Share** to copy a link that reopens the exact same synced setup, so you can
  hand a match to teammates. (Encoded in the URL hash, so it works on static
  hosting with no backend.)
- **Watch parties.** One person hosts, gets a 6-digit room code, and everyone
  who enters it watches the same POVs, sync points, and timestamp in their own
  browser — host plays/pauses/skips/switches and it follows for everyone.
  Requires a free Firebase project (see **Watch parties** below).
- A master-clock loop continuously corrects drift so the feeds stay aligned.
- **Max quality on every feed.** YouTube removed the API for choosing quality,
  and embeds cap resolution by player size. So each player is laid out 3840px
  wide and scaled down to fit, and YouTube serves the highest resolution the
  video has (up to 4K), even in the small sidebar players. Your connection can
  still make YouTube step down.
- Native YouTube chrome and captions are hidden (the app is the control
  surface); the Sync Setup wizard provides its own scrubber so you can still
  line up frames precisely. Clicking the main video also plays/pauses.

## Watch parties

Watch parties sync playback across different people's browsers, so they need a
tiny realtime backend. This project uses **Firebase Realtime Database**, which
has a free tier (Spark) that's far more than enough for this and **can't run up
a bill** — if you exceed its limits, operations just throttle rather than
charge you. The page itself still lives on static hosting (GitHub Pages); only
the live room coordination goes through Firebase.

### One-time setup (~5 min)

1. Go to the [Firebase console](https://console.firebase.google.com) and
   **Add project** (you can turn Google Analytics off).
2. In the left nav: **Build → Realtime Database → Create Database.** Pick a
   region, and start in **locked mode** (we'll set rules next).
3. **Realtime Database → Rules**, paste this, and **Publish**:
   ```json
   {
     "rules": {
       "rooms": {
         "$code": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
   This lets anyone read/write under `/rooms` (fine for a hobby party app —
   rooms are throwaway and keyed by a random code). For stronger protection you
   can later add Firebase App Check or anonymous auth.
4. **Project settings (gear) → General → Your apps → Web (`</>`)**, register an
   app, and copy the `firebaseConfig` values.
5. Paste them into [`firebase-config.js`](firebase-config.js) (`apiKey`,
   `authDomain`, `databaseURL`, `projectId`, `appId`). These web values aren't
   secret — Firebase ships them to every client by design.

That's it — the **👥 Party** button is now live.

### Using it

- **Host:** set up your POVs and sync points, click **👥 Party → Start a
  party**, and share the 6-digit code (or **Copy invite link**).
- **Guests:** click **👥 Party**, enter the code, **Join**. Everyone sees the same
  POVs, sync points, and timestamp; late joiners jump straight to the current
  moment.

There are three roles:

| Role | Play / pause / skip | Switch POV & audio | Videos, names, sync points |
| --- | --- | --- | --- |
| **Host** | ✓ | ✓ | ✓ |
| **Co-host** | ✓ | ✓ | — |
| **Viewer** | — | — | — |

Everyone joins as a viewer. The host opens the **👥 Party** panel and clicks
**Make co-host** / **Make viewer** next to anyone in the list. Playback and POV
changes from any co-host apply to everyone, including the host.

Everyone can set **Your name** at the top of the Party panel. It's remembered
in your browser and can be changed mid-party. Names appear in the people list
and in the live activity feed (bottom-left), where actions from others show up
for a couple of seconds, e.g. "Noah paused" or "Aaron skipped forward 5
seconds".

**Reloading is safe.** A reload automatically rejoins the room as the same
person, keeping your role (host, co-host, or viewer). Sound stays off until you
click once, because browsers don't allow audio to start without a click.

**If the host drops out** (closes the tab, loses connection) and isn't back
within 15 seconds, the next person takes over as host automatically — co-hosts
first, then whoever joined earliest. The old host becomes a co-host, so they
still have controls if they come back. Only the host's **End party** button
closes the room for everyone.

### Expectations

Cross-browser alignment is typically within ~0.25–1s (network latency +
buffering + coarse seeking). Host pause/skip/POV-switch propagate to everyone
within a moment. It is **not** frame-locked across machines — that isn't
achievable over the internet and isn't needed for watching together.

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
