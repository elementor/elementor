#!/bin/bash
set -eo pipefail

if [ -z "$SLACK_RELEASE_ANNOUNCEMENT_COPY" ]; then
  echo "SLACK_RELEASE_ANNOUNCEMENT_COPY organization variable is not set."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! CHANGELOG=$(node "${SCRIPT_DIR}/get-slack-changelog.js" "$RELEASE_VERSION"); then
  echo "::warning title=Slack release announcement::Could not build the changelog for ${RELEASE_VERSION}. Announcing without it."
  CHANGELOG=""
fi

PAYLOAD=$(echo "$SLACK_RELEASE_ANNOUNCEMENT_COPY" | jq -c \
  --arg channel "$CHANNEL" \
  --arg release_url "$RELEASE_URL" \
  --arg released_by "$RELEASED_BY" \
  --arg version "$RELEASE_VERSION" \
  --arg jira_release_url "${JIRA_RELEASE_URL:-}" \
  --arg changelog "$CHANGELOG" \
  '
  def apply_announcement_tokens($text; $product_display_name; $distribution_note; $jira_release_link; $release_line):
    $text
    | gsub("\\{product_display_name\\}"; $product_display_name)
    | gsub("\\{version\\}"; $version)
    | gsub("\\{released_by\\}"; $released_by)
    | gsub("\\{release_url\\}"; $release_url)
    | gsub("\\{distribution_note\\}"; $distribution_note)
    | gsub("\\{jira_release_link\\}"; $jira_release_link)
    | gsub("\\{release_line\\}"; $release_line);

  . as $copy |
  ($copy.distribution_notes[$channel] // "") as $channel_note |
  (if $channel_note == "" then "" else "\n\n" + $channel_note end) as $distribution_note |
  (if $jira_release_url == "" then "" else "\n\n📋 <" + $jira_release_url + "|View Jira Release>" end) as $jira_release_link |
  (if $jira_release_url == "" then "" else "GitHub Release *" + $version + "*\n" end) as $release_line |
  {
    blocks: ([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: (
            $copy.opening_line + "\n\n" +
            apply_announcement_tokens($copy.version_headline; $copy.product_display_name; $distribution_note; $jira_release_link; $release_line)
          )
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: apply_announcement_tokens($copy.release_details; $copy.product_display_name; $distribution_note; $jira_release_link; $release_line)
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: $copy.action_button_label,
            emoji: true
          },
          value: "open-release",
          url: $release_url,
          action_id: "button-action"
        }
      }
    ]
    + (if $changelog == "" then [] else [
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: $changelog
        }
      }
    ] end))
  }
  ')

{
  echo 'payload<<EOF'
  echo "$PAYLOAD"
  echo 'EOF'
} >> "$GITHUB_OUTPUT"
