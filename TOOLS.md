# TOOLS.md — robots-cache-test3

## What you have
- Shell: node, npm, git, curl (sandboxed — no docker/aws/ssh)
- File read/write on your workspace (which IS the live app code)
- web_fetch, web_search, browser, sub-agents, image analysis
- VibeKit API via the preset `VIBEKIT_*` env vars (see AGENTS.md for endpoints)

## Deploy — ONLY when the user's own message asks for it
Never deploy on your own initiative — "tap **Deploy**" stays the default close.
When the user's message explicitly says deploy/publish/ship/make-it-live:
commit your changes first, then:

```bash
curl -s -X POST "$VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_APP_ID/deploy-workspace?async=1" \
  -H "Authorization: Bearer $VIBEKIT_API_KEY"
# → { "jobId": "…" } — poll every ~5s until status is done|error:
curl -s "$VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_APP_ID/deploy-workspace/jobs/<jobId>" \
  -H "Authorization: Bearer $VIBEKIT_API_KEY"
```
`done` → confirm with the live URL. `error` → report the failing log line and
stop (one deploy attempt per ask — never retry-loop a broken build).

App logs: `GET $VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_SUBDOMAIN/logs`

## Image generation — real assets (logos, heroes, icons, illustrations)
Synchronous and fast (~5–15s): the image is written into your workspace before
the call returns. **Run the curl in the FOREGROUND and wait for the JSON** — if
the shell backgrounds it anyway, poll that process to completion BEFORE ending
your turn. Nothing runs after your turn ends: a backgrounded call you don't
wait for dies orphaned, no image ever lands, and "generating — I'll confirm
when it finishes" is a broken promise. Confirm only from the actual `{"ok":true}`
response. Billed to the user's credits (~4¢/image), so generate with intent —
one good asset, not a gallery of variants.

```bash
curl -s -X POST "$VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_APP_ID/agent/generate-image" \
  -H "Authorization: Bearer $VIBEKIT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"prompt":"minimal flat logo, coffee cup, warm orange on cream","path":"public/images/logo.png"}'
# → { "ok": true, "path": "public/images/logo.png", ... } — reference that path in the app
```

`path` = where YOUR app serves static files from (public/, static/, assets/…).
Optional: `"aspect_ratio":"16:9"` (hero) · `"model":"openai/gpt-image-1"` (only
when the image must contain readable TEXT — wordmarks/banners; default model is
faster + cheaper and best for everything else). 402 = user out of credits: tell
them plainly and use a CSS/SVG placeholder instead.

## Boot test (only after dep/server changes — see AGENTS.md §Ship working code)
ONE quiet boot on a random high port, never 3000/3010 or 4000–4999:

```bash
P=$((18000+RANDOM%2000)); PORT=$P node server.js & S=$!
for i in 1 2 3; do sleep 1; curl -s -o /dev/null -w '%{http_code}\n' localhost:$P && break; done; kill $S
```

## Parallel sub-agents — worktree isolation
When you fan work out to multiple sub-agents that touch DIFFERENT files, give
each its own git worktree (isolated branch + dir) so they never clobber each
other, then merge back. Gated by the app's **Worktree Isolation** / **Auto
Merge** settings — if disabled the create call returns 403, so just work
serially on main. Workflow:

```bash
# 1) Before spawning a sub-agent for a task, make its worktree:
curl -s -X POST $VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_APP_ID/worktree/create \
  -H "Authorization: Bearer $VIBEKIT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"taskId":"auth-refactor"}'
# → { "worktreePath": ".worktrees/auth-refactor", "branchName": "agent/task-auth-refactor" }
# 2) Tell that sub-agent to cd into worktreePath and do ALL its edits there.
# 3) When it finishes, merge back (auto-resolves conflicts — prefers newer
#    changes unless code was deleted; if Auto Merge is off, conflicting files
#    come back for you to resolve on the branch, main stays clean):
curl -s -X POST $VIBEKIT_API_URL/api/v1/hosting/app/$VIBEKIT_APP_ID/worktree/merge \
  -H "Authorization: Bearer $VIBEKIT_API_KEY" -H 'Content-Type: application/json' \
  -d '{"taskId":"auth-refactor"}'
# List active: GET …/worktrees · Clean up stragglers: POST …/worktree/cleanup
```
Use this only for genuinely parallel, file-disjoint work — for serial edits just
work on main.

## Webhooks
- Users manage webhooks from the dashboard Webhooks tab
- When triggered, you receive the payload in `<webhook_payload>` tags
- Auto-verified: GitHub (X-Hub-Signature-256), Stripe (Stripe-Signature)
- Rate limit: 10/min per app

## Notes
_(Add app-specific notes here: API keys needed, quirks, architecture decisions)_
