# PURPOSE
Creates a signed, time-limited URL that renders a snapshot of the current Elementor content of a post without publishing it. The URL is anonymous (no WordPress login required).

# WHEN TO USE
**Agent self-validation only.** Call this right after a mutation (e.g. `elementor/build-composition`, `elementor/manage-elements`, `elementor/update-page-settings`) so you can fetch the returned `url` with your browser/screenshot tool and verify the change rendered as intended.

# SITE PARTS
A site part (header, footer, single or archive template) has no page of its own. With Elementor Pro, its preview renders it in its location on the content it applies to: its "Preview Dynamic Content as" target, or the front page (the blog home when there is none) for headers and footers.

# WOOCOMMERCE STATE
Previews render as a logged-out visitor. With WooCommerce active, the cart holds the 2 latest in-stock simple products, so cart, checkout and menu-cart widgets render their filled state; nothing is saved to the store. The empty-cart states and the logged-in My Account view cannot be previewed. A single product site part renders with its "Preview Dynamic Content as" product.

# DO NOT SHARE `url` WITH THE USER
The `url` field is throwaway — time-limited, frozen to a snapshot, and stops working once it expires. It is meant for your own verification loop.

If the user needs a link, share the **`edit_url`** field returned by this same call. The editor link:
- Stays valid across sessions.
- Reflects live changes, not a frozen snapshot.
- Requires the user to be logged into WordPress with edit permissions — which is the correct access model for anyone who should be looking at draft content.
