Clears Elementor's outdated CSS files and cached data in the database (rendered HTML, JS/CSS assets, etc.), the same as WP Admin → Elementor → Tools → "Clear Files & Data". Elementor regenerates them the next time someone visits a page on the site, so the first load of each page can be slower. Needs no input.

Use it when the user asks to clear the Elementor cache, or when you are troubleshooting what looks like stale output: styles or content on the front end that don't match the editor, missing or outdated CSS, a layout that broke after a change to the site URL, a plugin, the theme or the global styles, or changes that don't show up.

Do NOT call it as a routine step after every edit. The tools that change the site already clear what they need to.

This clears Elementor's cache only. Caching plugins, server caches, CDNs and the browser cache are not cleared: tell the user to clear those too if the problem remains. Requires administrator permission.
