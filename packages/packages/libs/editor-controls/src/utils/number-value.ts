export const isEmptyDraft = ( raw: string ) => raw.trim() === '';

export const parseNumberDraft = ( raw: string, shouldForceInt = false ): number | null => {
	const trimmed = raw.trim();

	if ( trimmed === '' ) {
		return null;
	}

	const parsed = shouldForceInt ? parseInt( trimmed, 10 ) : Number( trimmed );

	return Number.isFinite( parsed ) ? parsed : null;
};

export const isInRange = ( value: number, min: number, max: number ) => value >= min && value <= max;

export const clamp = ( value: number, min: number, max: number ) => Math.min( Math.max( value, min ), max );
