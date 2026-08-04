#!/bin/bash
set -eo pipefail

if [ -z "$SLACK_RELEASE_ANNOUNCEMENT_COPY" ]; then
  echo "SLACK_RELEASE_ANNOUNCEMENT_COPY organization variable is not set."
  exit 1
fi

PAYLOAD=$(echo "$SLACK_RELEASE_ANNOUNCEMENT_COPY" | jq -c \
  --arg channel "$CHANNEL" \
  --arg release_url "$RELEASE_URL" \
  --arg released_by "$RELEASED_BY" \
  --arg version "$RELEASE_VERSION" \
  --arg jira_release_url "${JIRA_RELEASE_URL:-}" \
  '
  def apply_announcement_tokens($text; $product_display_name; $distribution_note; $jira_release_link):
    $text
    | gsub("\\{product_display_name\\}"; $product_display_name)
    | gsub("\\{version\\}"; $version)
    | gsub("\\{released_by\\}"; $released_by)
    | gsub("\\{release_url\\}"; $release_url)
    | gsub("\\{distribution_note\\}"; $distribution_note)
    | gsub("\\{jira_release_link\\}"; $jira_release_link);

  . as $copy |
  ($copy.distribution_notes[$channel] // "") as $channel_note |
  (if $channel_note == "" then "" else "\n\n" + $channel_note end) as $distribution_note |
  (if $jira_release_url == "" then "" else "\n\n📋 <" + $jira_release_url + "|View Jira Release>" end) as $jira_release_link |
  {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: (
            $copy.opening_line + "\n\n" +
            apply_announcement_tokens($copy.version_headline; $copy.product_display_name; $distribution_note; $jira_release_link)
          )
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: apply_announcement_tokens($copy.release_details; $copy.product_display_name; $distribution_note; $jira_release_link)
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
  }
  ')

{
  echo 'payload<<EOF'
  echo "$PAYLOAD"
  echo 'EOF'
} >> "$GITHUB_OUTPUT"
