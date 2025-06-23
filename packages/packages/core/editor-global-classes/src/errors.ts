import { createError } from '@elementor/utils';

export const GlobalClassNotFoundError = createError< { styleId: string } >( {
	code: 'global_class_not_found',
	message: 'Global class not found.',
} );

export const GlobalClassLabelAlreadyExistsError = createError< { label: string } >( {
	code: 'global_class_label_already_exists',
	message: 'Class with this name already exists.',
} );
