// ---------------------------------------------------------------------------
// Firebase config for MultiPOV watch parties.
//
// Watch parties need a (free) Firebase Realtime Database to relay room state
// between browsers. Fill in the values below to enable them. Until you do, the
// app works fully in solo mode and the "Party" button just points you here.
//
// Setup (see README.md → "Watch parties" for the detailed version):
//   1. Create a project at https://console.firebase.google.com (Analytics off is fine).
//   2. Build → Realtime Database → Create Database → pick a region → Start.
//   3. Project settings (gear) → Your apps → add a Web app → copy its config.
//   4. Paste the values below and set the database rules from the README.
//
// Note: these web config values are NOT secret — Firebase ships them to every
// client by design. Access is controlled by the database rules, not by hiding
// this file. You can still .gitignore it if you prefer to keep it out of git.
// ---------------------------------------------------------------------------
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  appId: ""
};
