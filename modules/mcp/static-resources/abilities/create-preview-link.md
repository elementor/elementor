# PURPOSE
Creates a signed, time-limited URL that renders a snapshot of the current Elementor content of a post without publishing it. The URL is anonymous (no WordPress login required).

# WHEN TO USE
**Agent self-validation only.** Call this right after a mutation (e.g. `elementor/build-composition`, `elementor/manage-elements`, `elementor/update-page-settings`) so you can fetch the returned `url` with your browser/screenshot tool and verify the change rendered as intended.

# DO NOT SHARE THIS URL WITH THE USER
The preview link produced by this tool is throwaway — it is time-limited, points to a frozen revision snapshot, and will stop working once it expires. It is meant for your own verification loop.

If the user needs a link to view or continue editing the page, send them the **Elementor editor link** instead (returned as `edit_url` by `elementor/create-page` and available on any existing document). The editor link:
- Stays valid across sessions.
- Reflects live changes, not a frozen snapshot.
- Requires the user to be logged into WordPress with edit permissions — which is the correct access model for anyone who should be looking at draft content.
