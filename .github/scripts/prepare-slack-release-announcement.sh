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
  '
  def apply_announcement_tokens($text; $product_display_name; $distribution_note):
    $text
    | gsub("\\{product_display_name\\}"; $product_display_name)
    | gsub("\\{version\\}"; $version)
    | gsub("\\{released_by\\}"; $released_by)
    | gsub("\\{release_url\\}"; $release_url)
    | gsub("\\{distribution_note\\}"; $distribution_note);

  . as $copy |
  ($copy.distribution_notes[$channel] // "") as $channel_note |
  (if $channel_note == "" then "" else "\n\n" + $channel_note end) as $distribution_note |
  {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: (
            $copy.opening_line + "\n\n" +
            apply_announcement_tokens($copy.version_headline; $copy.product_display_name; $distribution_note)
          )
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: apply_announcement_tokens($copy.release_details; $copy.product_display_name; $distribution_note)
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
