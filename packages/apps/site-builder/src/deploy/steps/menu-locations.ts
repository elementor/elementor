import apiFetch from '@wordpress/api-fetch';

export type WpMenuLocation = {
	name: string;
	description: string;
};

export async function fetchMenuLocationSlugs(): Promise< string[] > {
	const locations = await apiFetch<
		Record< string, WpMenuLocation > | WpMenuLocation[]
	>( {
		path: '/wp/v2/menu-locations',
	} );

	if ( ! locations ) {
		return [];
	}

	if ( Array.isArray( locations ) ) {
		return locations.map( ( location ) => location.name ).filter( Boolean );
	}

	return Object.keys( locations );
}

export function resolveMenuLocation(
	availableSlugs: string[],
	candidates: string[],
	fallbackPattern?: RegExp
): string | undefined {
	for ( const candidate of candidates ) {
		if ( availableSlugs.includes( candidate ) ) {
			return candidate;
		}
	}

	if ( fallbackPattern ) {
		const matched = availableSlugs.find( ( slug ) =>
			fallbackPattern.test( slug )
		);
		if ( matched ) {
			return matched;
		}
	}

	return availableSlugs[ 0 ];
}

export function isInvalidMenuLocationError( error: unknown ): boolean {
	if ( ! error || typeof error !== 'object' ) {
		return false;
	}

	const err = error as {
		code?: string;
		data?: { details?: { locations?: { code?: string } } };
	};
	if (
		err.code === 'rest_invalid_param' &&
		err.data?.details?.locations?.code === 'rest_invalid_menu_location'
	) {
		return true;
	}

	return err.code === 'rest_invalid_menu_location';
}
