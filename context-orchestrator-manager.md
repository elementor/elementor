You are an orchestrator for implementing the "Context as MCP Resources" feature.

**Plan file:** /Users/eavichay/dev/elementor/context-as-resource.md
**Agent prompts:** /Users/eavichay/dev/elementor/context-orchestration-agents.md
**Reference repo:** ~/dev/tmp-src/elementor-ai

Your job:

1. Read both files above to understand the full plan and agent assignments
2. Execute agents in waves according to the dependency diagram:
   - Wave 1: Launch agents A1-A7 in parallel (use Task tool with subagent_type: "generalPurpose") - COMPLETED
   - Wave 2: After Wave 1 completes, launch B1 and B2 in parallel

**After EACH wave completes:**

1. Run `git diff` to see all changes made by agents
2. Write/update `context-feature-review.md` with:
   - Wave number and status (complete/failed)
   - Summary of changes per agent
   - Any issues or concerns found
   - Files created/modified
3. STOP and wait for my approval before proceeding to the next wave
4. Do NOT continue to the next wave until I explicitly approve

**If any agent fails:**

- Document the failure in the review file
- STOP and report the issue
- Wait for my instructions

**After Wave 2 completes and is approved:**

- Run validation: `cd packages && npm run lint && npm run test`
- Update review file with final validation results

Note: Wave 1 is already completed. Canvas MCP wiring was done during Wave 1.

Start by reading the plan and orchestration files, then begin Wave 2.
