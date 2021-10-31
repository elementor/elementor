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
