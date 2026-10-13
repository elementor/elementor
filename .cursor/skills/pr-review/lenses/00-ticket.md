# Ticket pass

Input: ED key. Read the Jira issue and linked spec via Atlassian tools, read-only. Read the PR description.

Produce, tersely:
- logic: 2-4 lines
- AC: numbered list
- conflicts: AC vs AC, AC vs description, AC vs existing behavior
- ambiguities and missing edge cases (empty, invalid, permissions, license off/expired, RTL, responsive, import/export, undo, multisite, Core-only vs Pro active)
- free vs Pro: where the feature should live and its gating
- LOOK-FOR list: concrete things to verify in code/tests, each tagged with the lens that should check it

Output format: sections `logic`, `AC`, `conflicts`, `edge`, `placement`, `look-for`. No ticket text pasted back. If the spec is broken, say `SPEC BROKEN: <why>` first.
