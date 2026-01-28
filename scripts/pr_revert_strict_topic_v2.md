Title: Revert: strict-topic v2 over-applied mark-scheme text

Description:
This PR restores concise canonical unit definitions that were overwritten by a topic-aware "strict_topic_v2" automated pass which applied mark-scheme style answers in place of short definitions.

Changes included:
- Reverted packet definitions to concise forms: `Header`, `Payload`, `Trailer` (cs-2)
- Reverted `Odd parity` and `ARQ` (cs-2) to concise protocol/definition text
- Reverted `DNS` and `IP address` (cs-5) to concise definitions

Backups and logs:
- Backup of pre-revert file: `src/data/units.ts.revert-20260110T121500.bak`
- Reverts recorded in: `src/data/reverts_applied.json` and `src/data/reverts_applied.txt`
- Proposed diff (for review): `scripts/proposed_reverts.diff` (included in branch)

Notes:
- I also ran the conservative QA-sync (`scripts/sync_qa_from_units.mjs`) after applying the reverts; it found 0 auto-sync proposals.
- Branch: `revert/strict-topic-v2-reverts-20260110` (pushed to origin). You can open a PR via the web UI: https://github.com/blueblueIsa/blueblueIsa.github.io.isaigcs/pull/new/revert/strict-topic-v2-reverts-20260110

Please review the proposed changes and let me know if you want additional reverts or tweaks to wording before merging.
