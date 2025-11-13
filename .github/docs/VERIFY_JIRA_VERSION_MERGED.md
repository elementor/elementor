# Verify Jira Version Merged to Branch

This workflow verifies that all tickets in a Jira version are merged to their corresponding GitHub branch.

## Setup Requirements

### 1. Configure Repository Secrets

You need to add three secrets to your GitHub repository:

- **`JIRA_HOST`**: Your Jira host (e.g., `elementor.atlassian.net`)
- **`JIRA_USER`**: Your Jira email address
- **`JIRA_API_TOKEN`**: Your Jira API token

#### How to get Jira API Token:

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token
5. Add it to GitHub secrets as `JIRA_API_TOKEN`

#### Add Repository Secrets:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the values above

## Usage

### Manual Trigger (GitHub UI)

1. Go to **Actions** tab
2. Select **"Verify Jira Version Merged to Branch"** workflow
3. Click **"Run workflow"**
4. Fill in the inputs:
   - **Jira Version**: `v3.33.1` (the version to check)
   - **Target Branch**: `3.33` (the branch where tickets should be merged)
   - **Base Branch**: `main` (optional, defaults to `main`)
5. Click **"Run workflow"**

### Via GitHub CLI

```bash
gh workflow run verify-jira-version-merged.yml \
  -f jira_version=v3.33.1 \
  -f target_branch=3.33 \
  -f base_branch=main
```

## How It Works

1. **Fetch Jira Tickets**: Queries Jira REST API to get all tickets in the specified version
2. **Fetch Branch Commits**: Gets all commits in the target branch (compared to base branch)
3. **Extract Ticket Keys**: Looks for ticket keys (ED-XXXX) in commit messages
4. **Compare**: Checks which Jira tickets are NOT found in the branch commits
5. **Report**: Generates a summary showing:
   - Total tickets in the Jira version
   - Number of merged tickets
   - List of missing tickets (if any)

## Output

The workflow generates:

- **Job Summary**: Shows verification results in the Actions UI
- **Exit Code**: Fails if any tickets are missing (useful for blocking releases)
- **Console Output**: Detailed logs of all steps

### Example Results

#### ✅ All Tickets Merged
```
✅ Success! All 42 tickets from v3.33.1 are merged to 3.33
```

#### ⚠️ Some Tickets Missing
```
⚠️ 3 tickets are missing from 3.33:
   - ED-12345
   - ED-12346
   - ED-12347
```

## Integration with Release Workflow

You can add this as a pre-release check:

```yaml
jobs:
  verify-version:
    name: Verify Jira Version
    uses: ./.github/workflows/verify-jira-version-merged.yml
    with:
      jira_version: ${{ env.JIRA_VERSION }}
      target_branch: release/${{ env.VERSION }}
  
  release:
    name: Create Release
    needs: [verify-version]
    if: needs.verify-version.outputs.verification_result == 'success'
    # ... rest of release job
```

## Troubleshooting

### "Missing environment variables" error

Make sure you've set these GitHub repository secrets:
- `JIRA_HOST`
- `JIRA_USER`
- `JIRA_API_TOKEN`

### "Could not fetch commits" warning

This might mean:
- Target branch doesn't exist yet
- No commits differ from the base branch
- The branch naming is incorrect

### "Jira API error (401)"

Your Jira credentials are incorrect or expired:
- Verify `JIRA_USER` is your Jira email
- Regenerate your API token at https://id.atlassian.com/manage-profile/security/api-tokens
- Update the `JIRA_API_TOKEN` secret

### "Found 0 tickets in version"

- Version name might be different (try without 'v' prefix or with different format)
- Check the exact version name in your Jira instance
- Verify the project key is 'ED'

## Notes

- The workflow looks for ticket keys in the format `ED-XXXX`
- Jira version name is automatically cleaned (e.g., `v3.33.1` → `3.33.1`)
- The comparison uses git commits from the base branch to target branch
- Missing Jira API token will cause the workflow to fail gracefully with clear error messages

