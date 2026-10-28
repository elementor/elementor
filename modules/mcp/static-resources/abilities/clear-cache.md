Clears Elementor's outdated CSS files and cached data in the database (rendered HTML, JS/CSS assets, etc.), the same as WP Admin → Elementor → Tools → "Clear Files & Data". Elementor regenerates them the next time someone visits a page on the site, so the first load of each page can be slower. Needs no input.

Only call it when the user asks to clear the Elementor cache, or after they agree to your suggestion to clear it. Never call it on your own. Suggest it when you are troubleshooting what looks like stale output: styles or content on the front end that don't match the editor, missing or outdated CSS, a layout that broke after a change to the site URL, a plugin, the theme or the global styles, or changes that don't show up.

Do NOT call it as a routine step after every edit. The tools that change the site already clear what they need to. Call it at most once per problem: if the problem remains after clearing, it is not Elementor's cache, so point the user to their caching plugin, CDN or browser cache instead of calling it again.

This deletes the site's Elementor CSS files. On a site with a caching plugin, server cache or CDN, cached pages can still point to the deleted files and show without styles until that cache is cleared too: tell the user to clear it right after. Caches outside Elementor are not cleared by this tool. Requires administrator permission.
