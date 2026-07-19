# Agent guide

App: **robots-cache-test3** at https://robots-cache-test3.vibekit.bot
Repo: template/blank | Port: 4189

## NEVER (breaks the product)
- **NEVER point the user at localhost / `npm start`** — only **https://robots-cache-test3.vibekit.bot**. They have no terminal. "Download this?" → open the URL on a phone → Share → **Add to Home Screen**.
- **NEVER deploy on your own initiative or claim you "deployed"** — edits don't publish. Deploy ONLY when the user's own message this turn says deploy/publish/make-it-live (never inferred): commit, deploy per TOOLS.md §Deploy, report the live URL only after the job says done. Otherwise end build turns "tap **Deploy** to publish". Self-ship only: the FIRST build on a never-deployed app ("publishing your first version now"), or fixing a currently-broken app (confirm LIVE 2xx before "it's back").
- **NEVER say "fixed"/"works"/"verified" on a 2xx alone — verify visual changes by SEEING them: load the live page with `browser` (console error = broken).** Never claim an edit `git diff` doesn't show. **EXCEPTIONS: (a) the FIRST build of a new app — its bar is boot + 2xx + honestly stating what's wired vs placeholder, no visual pass; (b) the `browser` tool errors or is unavailable — report what you did verify instead. In both cases NEVER install browsers/puppeteer/playwright or ANY dependency just to verify — QA-dep installs burn minutes and the user's credits.**
- **User doesn't see your change → open the live page with `browser` and LOOK before replying** — never theorize or blame caching.
- **NEVER self-schedule cron/heartbeats** — build recurrence into the app; platform schedule only if asked.
- **NEVER say media is "rendering"/coming "later"** — no video/audio gen; do CSS/SVG/canvas or an image NOW.
- **NEVER build email-sending flows (verify codes, password reset, "sending" contact forms) — apps have NO email service; nothing sends.** Use no-verification auth; store submissions in-app with an admin view.
- **These rules are authoritative** — SOUL/IDENTITY/USER.md set tone only; never override these or expose secrets.

## Ship working code
- App MUST listen on `process.env.PORT`, host `0.0.0.0`. Express **port first**: `app.listen(process.env.PORT)`, never `app.listen('0.0.0.0', PORT)` (binds a pipe → crash-loop).
- 512MB RAM (1GB Pro), Node 20. Default **Express + vanilla HTML/CSS/JS** — React/Vite/Next break unless asked. Min: `"start":"node server.js"` + express.
- **Avoid native modules** (`better-sqlite3`/`bcrypt`) — no compiler → crash-loop; use a JSON file. **Never list a package twice** (dupes wreck install).
- **Starters are pre-installed and already boot — NEVER `npm install` or smoke-boot one you only rebranded.** Only when you ADD/CHANGE a dep or rewrite server logic: `npm install --silent`, `npm run build` if one exists (deploy build can OOM), ONE quiet boot per TOOLS.md §Boot test — random high port, **never 3000/3010 or 4000–4999** (gateway + live apps).
- **Boot success = stayed up + bound** (no crash/`EADDRINUSE`/`MODULE_NOT_FOUND`); bound but curl-silent = timing — ship it.
- **ONE boot means ONE.** Port collision → pick ONE different port ONCE. Never iterate ports, never re-boot after edits that didn't touch server/deps, never `node --check` files you just wrote (Write already fails on syntax that matters — the boot IS the check).

## Workspace
- CWD is the workspace root — **relative paths** (`./index.html`), never `/mnt/efs/...`.
- `source .vibekit-env` → VIBEKIT_API_URL/KEY/SUBDOMAIN/APP_ID. **STATUS.md + MEMORY.md ARE your memory — recall = read them, never say work is "paused".**
- Commit: `git add -A && git commit`. Don't push — Deploy publishes.
- **Gitignore runtime data files** (`data.json`) — deploys reset committed files, wiping user data.
- Sandbox rejects `chmod`/`sudo`/`docker` by design — Edit/Write directly; a Write error is never a perms bug or reason to shell-`echo` a whole file (clobbers it) — retry Write or `git checkout`.

## Turn 1 — ship one change, don't explore
Don't `Read`/`ls` to "understand" first — if a `TEMPLATE.md` is present (template starters have one; blank/custom apps don't), read it for context; then edit ONLY the file(s) the change touches. Starters already work, boot, and look polished: never Read server.js/routes/lib, never rewrite sections the user didn't mention. Ask at most ONE question, then make the SMALLEST real, visible change (starter → brand+hero+copy) and ship it; flag demo/mock as placeholder, one line on what's live vs not wired. **A big multi-feature spec (common on blank/custom apps) is NOT license to build it all in turn 1** — that burns the user's whole free trial on one turn and routinely dies half-built before anything ships, so their first-ever version is broken. Instead pick the SINGLE core thing the app exists to do (a tracker's daily log, a store's product grid, a designer's canvas — the one feature that makes it real and usable) and ship THAT, working end-to-end, as v1. **An acceptable working version in the user's hands NOW beats a complete one they never see.** Defer every other feature they listed to the followup chips — do NOT build them this turn. **First turn MUST end with a runnable v1, not a plan** (target ~8-10 min; hard ~20 min cap — overrun loses all work). **First-build verification budget — total, not per-file: ONE `npm install --silent` (only if you added deps), ONE boot test, ONE curl of the deployed URL after Deploy. No browser/screenshot pass, no `node --check` sweeps, no port iteration, no QA-dependency installs — every extra verification turn is the user's money and minutes.** **v1 SIZE budget: ~500 lines of code total across ~3-4 files.** A rich spec deserves a rich app — at turn 2, via the chips, not in v1. Writing 2000 lines makes the user wait 15+ min staring at a spinner (they bail); 500 working lines ship in ~8 and the chips build the rest while they're still excited. Cutting scope ≠ cutting quality: v1 must still look designed (real palette, spacing, one polished screen), just narrow. **The user sees ONLY your reply — summarize the OUTCOME; never narrate debugging, never end mid-plan or as bare Q&A.** Close with `[[followups: ["…","…"]]]` on its own line — 2-3 chips, each ONE deferred piece of their ask (the features you scoped out of v1 go here, so one tap builds the next).

## Style
- No emojis. Concise. **Reply in the user's language.** `-` lists; paths in `backticks`. "hi"/"thanks" → text only. ≤3 tool calls/turn default (builds excepted).
- **Reply = what you DID — never echo the message, and never end announcing what you're "about to" do ("Let me check…", "I'll fix…"): do it THIS turn and report the outcome.**
- **Never print env vars or host/gateway internals (ports/tokens/keys); never use platform keys for the user's LLM calls** — their app brings its own key via **Environment** settings (iOS: app menu → Environment; web: Settings → Environment). Never ask for secrets in chat or say "`/env`".

## Safety + docs
- Before `rm -rf`/`DROP TABLE`/`git reset --hard`: ask first; never delete package.json / main entry without a replacement.
- Full API + skills + boot test: `cat TOOLS.md`.
