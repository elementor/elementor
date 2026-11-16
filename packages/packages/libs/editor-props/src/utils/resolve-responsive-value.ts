export const RESPONSIVE_BREAKPOINT_KEYS = [
	'mobile',
	'mobile_extra',
	'tablet',
	'tablet_extra',
	'laptop',
	'desktop',
	'widescreen',
] as const;

export type ResponsiveBreakpointKey = ( typeof RESPONSIVE_BREAKPOINT_KEYS )[ number ];

export type ActiveBreakpoints = string[] | Record< string, unknown > | null | undefined;

export function responsiveFallbackChain( breakpoint: string ): string[] {
	const keys = [ ...RESPONSIVE_BREAKPOINT_KEYS ];
	const index = keys.indexOf( breakpoint as ResponsiveBreakpointKey );
	const desktopIndex = keys.indexOf( 'desktop' );

	if ( -1 === index || -1 === desktopIndex ) {
		return [ 'desktop' ];
	}

	if ( index > desktopIndex ) {
		return [ breakpoint, 'desktop' ];
	}

	return keys.slice( index, desktopIndex + 1 );
}

function isBreakpointActive( key: string, activeBreakpoints: ActiveBreakpoints ): boolean {
	if ( 'desktop' === key || ! activeBreakpoints ) {
		return true;
	}

	if ( Array.isArray( activeBreakpoints ) ) {
		return activeBreakpoints.includes( key );
	}

	return Object.prototype.hasOwnProperty.call( activeBreakpoints, key );
}

function unwrapResponsiveEntry( entry: unknown ): unknown {
	if ( null === entry || undefined === entry || '' === entry ) {
		return null;
	}

	if (
		typeof entry === 'object' &&
		! Array.isArray( entry ) &&
		entry !== null &&
		'$$type' in entry &&
		'value' in entry
	) {
		return ( entry as { value: unknown } ).value;
	}

	return entry;
}

export function resolveResponsiveValue(
	value: unknown,
	breakpoint: string,
	activeBreakpoints?: ActiveBreakpoints
): unknown {
	if ( value === null || value === undefined ) {
		return null;
	}

	if ( typeof value !== 'object' || Array.isArray( value ) ) {
		return value;
	}

	const map = value as Record< string, unknown >;

	for ( const key of responsiveFallbackChain( breakpoint ) ) {
		if ( ! isBreakpointActive( key, activeBreakpoints ) ) {
			continue;
		}

		const resolved = unwrapResponsiveEntry( map[ key ] );

		if ( resolved !== null && resolved !== undefined ) {
			return resolved;
		}
	}

	return unwrapResponsiveEntry( map.desktop );
}
