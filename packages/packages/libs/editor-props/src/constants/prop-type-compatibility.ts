import { type PropType } from '../types';

export const PROP_TYPE_COMPATIBILITY_MAP: Record< string, string[] > = {
	html: [ 'string' ],
	string: [ 'html' ],
};

export function getCompatibleTypeKeys( propType: PropType ): string[] {
	if ( propType.kind === 'union' ) {
		return [];
	}

	const compatibleKeys = propType.meta?.compatibleTypeKeys as string[] | undefined;

	if ( Array.isArray( compatibleKeys ) ) {
		return compatibleKeys;
	}

	return PROP_TYPE_COMPATIBILITY_MAP[ propType.key ] ?? [];
}
