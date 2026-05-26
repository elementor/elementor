// Returns the set of dashed-line positions: both edges of every gap (and outer
// boundaries of the track grid). N tracks → at most 2N boundaries.
export function computeBoundaries( sizes: number[], gap: number, offset: number ): number[] {
	if ( sizes.length === 0 ) {
		return [];
	}

	const boundaries: number[] = [];
	let cursor = offset;

	for ( let i = 0; i < sizes.length; i++ ) {
		if ( i === 0 ) {
			boundaries.push( cursor );
		}

		cursor += sizes[ i ];
		boundaries.push( cursor );

		if ( i < sizes.length - 1 && gap > 0 ) {
			cursor += gap;
			boundaries.push( cursor );
		}
	}

	return boundaries;
}

export function snapToHalfPixel( value: number ): number {
	return Math.round( value ) + 0.5;
}

export function parseTrackList( value: string ): number[] {
	if ( ! value || value === 'none' ) {
		return [];
	}

	return value
		.trim()
		.split( /\s+/ )
		.map( toPx )
		.filter( ( n ) => n > 0 );
}

export function toPx( value: string ): number {
	const parsed = parseFloat( value );

	return Number.isFinite( parsed ) ? parsed : 0;
}
