import { __ } from '@wordpress/i18n';

import { type OverridablePropsGroup } from '../../../types';

export const ERROR_MESSAGES = {
	EMPTY_NAME: __( 'Group name is required', 'elementor' ),
	DUPLICATE_NAME: __( 'Group name already exists', 'elementor' ),
} as const;

export function validateGroupLabel( label: string, existingGroups: Record< string, OverridablePropsGroup > ): string {
	const trimmedLabel = label.trim();

	if ( ! trimmedLabel ) {
		return ERROR_MESSAGES.EMPTY_NAME;
	}

	const isDuplicate = Object.values( existingGroups ).some( ( group ) => group.label === trimmedLabel );

	if ( isDuplicate ) {
		return ERROR_MESSAGES.DUPLICATE_NAME;
	}

	return '';
}
