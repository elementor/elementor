// Escape HTML special chars to prevent XSS.
export const escapeHTML = ( str ) => {
	const specialChars = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;',
	};

	return str.replace( /[&<>'"]/g, ( tag ) => specialChars[ tag ] || tag );
};

// Check if Scroll-Snap is active.
export const isScrollSnapActive = () => {
	const scrollSnapStatus = elementorFrontend.isEditMode() ? elementor.settings.page.model.attributes?.scroll_snap : elementorFrontend.config.settings.page?.scroll_snap;

	return 'yes' === scrollSnapStatus ? true : false;
};
