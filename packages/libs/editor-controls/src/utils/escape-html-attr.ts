export const escapeHtmlAttr = ( value: string ): string => {
	const specialChars: Record< string, string > = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		"'": '&#39;',
		'"': '&quot;',
	};

	return value.replace( /[&<>'"]/g, ( char ) => specialChars[ char ] || char );
};
