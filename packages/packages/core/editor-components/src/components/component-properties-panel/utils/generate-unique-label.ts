import { type OverridablePropsGroup } from '../../../types';

const DEFAULT_NEW_GROUP_LABEL = 'New group';

export function generateUniqueLabel( groups: OverridablePropsGroup[] ): string {
	const existingLabels = new Set( groups.map( ( group ) => group.label ) );

	if ( ! existingLabels.has( DEFAULT_NEW_GROUP_LABEL ) ) {
		return DEFAULT_NEW_GROUP_LABEL;
	}

	let index = 1;
	let newLabel = `${ DEFAULT_NEW_GROUP_LABEL }-${ index }`;

	while ( existingLabels.has( newLabel ) ) {
		index++;
		newLabel = `${ DEFAULT_NEW_GROUP_LABEL }-${ index }`;
	}

	return newLabel;
}
