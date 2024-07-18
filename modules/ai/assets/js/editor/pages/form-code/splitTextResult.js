export function splitText( inputText ) {
	if ( ! inputText ) {
		return {};
	}
	const codeMatch = inputText.match( /```([\s\S]*?)```/ );
	const code = codeMatch ? `\`\`\`${ codeMatch[ 1 ] }\`\`\``.trim() : '';

	const detailsMatch = inputText.match( /```[\s\S]*?```([\s\S]*)/ );
	const details = detailsMatch?.[ 1 ].trim();

	return {
		code,
		details,
	};
}
