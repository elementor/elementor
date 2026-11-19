export type Shell = {
	tag: string;
	attrs: Record< string, string >;
	inner: string;
};

export function parseShell( html: string ): Shell | null {
	const trimmed = html.trim();

	if ( ! trimmed.startsWith( '<' ) ) {
		return null;
	}

	const openTagEnd = findOpenTagEnd( trimmed );
	if ( openTagEnd === -1 ) {
		return null;
	}

	const openTagContent = trimmed.slice( 1, openTagEnd );
	const spaceIdx = openTagContent.search( /[\s/]/ );
	const rawTag = spaceIdx === -1 ? openTagContent : openTagContent.slice( 0, spaceIdx );
	const tag = rawTag.toLowerCase();

	if ( ! /^[a-z][a-z0-9-]*$/.test( tag ) ) {
		return null;
	}

	const closingTag = `</${ tag }>`;
	const closingTagStart = trimmed.lastIndexOf( closingTag );

	if ( closingTagStart === -1 || closingTagStart + closingTag.length !== trimmed.length ) {
		return null;
	}

	const attrsStr = spaceIdx === -1 ? '' : openTagContent.slice( spaceIdx );
	const attrs = parseAttrs( attrsStr );
	const inner = trimmed.slice( openTagEnd + 1, closingTagStart );

	return { tag, attrs, inner };
}

export function syncAttributes( el: HTMLElement, next: Record< string, string > ): void {
	Array.from( el.attributes )
		.filter( ( attr ) => ! ( attr.name in next ) )
		.forEach( ( attr ) => el.removeAttribute( attr.name ) );

	Object.entries( next ).forEach( ( [ name, value ] ) => {
		if ( el.getAttribute( name ) !== value ) {
			el.setAttribute( name, value );
		}
	} );
}

function findOpenTagEnd( html: string ): number {
	let inQuote: string | null = null;
	for ( let i = 1; i < html.length; i++ ) {
		const ch = html[ i ];
		if ( inQuote ) {
			if ( ch === inQuote ) {
				inQuote = null;
			}
		} else if ( ch === '"' || ch === "'" ) {
			inQuote = ch;
		} else if ( ch === '>' ) {
			return i;
		}
	}
	return -1;
}

function parseAttrs( attrsStr: string ): Record< string, string > {
	const attrs: Record< string, string > = {};
	const pattern = /\s+([a-zA-Z:_][a-zA-Z0-9:_.-]*)(?:="([^"]*)")?/g;
	let match;
	while ( ( match = pattern.exec( attrsStr ) ) !== null ) {
		attrs[ match[ 1 ] ] = match[ 2 ] ?? '';
	}
	return attrs;
}
