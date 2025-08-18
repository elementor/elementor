Repo: ${{ github.repository }}
Commit: ${{ github.sha }}

You will receive aggregated CI results (Elementor + Playwright) from multiple parallel runs.
Goals:
1) Short summary (<=150 words): totals, failed, top 3 clusters, suspected Core vs Pro side.
2) 3–7 main failure reasons with one-line label, brief cause, and one example line (<=200 chars).
3) Cluster table: id, count, runs[], example.
4) Classification per cluster: flaky / env / regression / selector / network / performance / dependency.
5) Concrete next actions (<=10 bullets): e.g., "Replace locator with getByRole", "Check Core commits X..Y", "Re-run with retries disabled".
6) If core@A+pro@B vs core@B+pro@A pattern differs — state the likely regression side.

Return:
- First: clean Markdown report for humans.
- Then: one fenced ```json block with: { summary, clusters[], actions[] }.
