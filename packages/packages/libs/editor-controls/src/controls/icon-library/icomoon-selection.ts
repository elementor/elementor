const DEFAULT_ICOMOON_VIEWBOX = 1024;

type IcomoonSelection = {
	icons?: Array< {
		icon?: { paths?: unknown; width?: unknown; tags?: unknown };
		properties?: { name?: unknown };
	} >;
	preferences?: { fontPref?: { prefix?: unknown } };
};

export function parseIcomoonSelection(
	selectionJson: string,
	prefix: string,
	displayPrefix: string,
	iconNames: string[]
): Record< string, string > {
	let data: IcomoonSelection;

	try {
		data = JSON.parse( selectionJson ) as IcomoonSelection;
	} catch {
		return {};
	}

	const resolvedDisplayPrefix = displayPrefix || prefix.replace( /-$/, '' );
	const names = iconNames.length > 0 ? iconNames : namesFromSelection( data );
	const result: Record< string, string > = {};

	for ( const name of names ) {
		const markup = svgForName( data, name, prefix );

		if ( ! markup ) {
			continue;
		}

		result[ `${ resolvedDisplayPrefix } ${ prefix }${ name }`.trim() ] = markup;
	}

	return result;
}

export function namesFromSelection( data: IcomoonSelection ): string[] {
	if ( ! Array.isArray( data.icons ) ) {
		return [];
	}

	return data.icons.flatMap( ( icon ) => {
		const name = iconEntryName( icon );

		return name ? [ name ] : [];
	} );
}

function svgForName( data: IcomoonSelection, iconName: string, prefix: string ): string | null {
	const candidates = [ iconName ];

	if ( prefix && iconName.startsWith( prefix ) ) {
		candidates.push( iconName.slice( prefix.length ) );
	}

	for ( const icon of data.icons ?? [] ) {
		const name = iconEntryName( icon );

		if ( ! name || ! candidates.includes( name ) ) {
			continue;
		}

		const paths = Array.isArray( icon.icon?.paths )
			? icon.icon.paths.filter( ( path ): path is string => typeof path === 'string' && path !== '' )
			: [];

		if ( paths.length === 0 ) {
			return null;
		}

		const size =
			typeof icon.icon?.width === 'number' && icon.icon.width > 0 ? icon.icon.width : DEFAULT_ICOMOON_VIEWBOX;
		const pathMarkup = paths
			.map( ( d ) => `<path d="${ escapeAttribute( d ) }" fill="currentColor"></path>` )
			.join( '' );

		return (
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ size } ${ size }" fill="currentColor" width="100%" height="100%">` +
			pathMarkup +
			'</svg>'
		);
	}

	return null;
}

function iconEntryName( icon: NonNullable< IcomoonSelection['icons'] >[ number ] ): string {
	if ( typeof icon.properties?.name === 'string' ) {
		return icon.properties.name;
	}

	const tag = icon.icon?.tags;

	return Array.isArray( tag ) && typeof tag[ 0 ] === 'string' ? tag[ 0 ] : '';
}

function escapeAttribute( value: string ): string {
	return value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}
