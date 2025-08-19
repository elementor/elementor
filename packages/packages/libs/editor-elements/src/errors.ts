import { createError } from '@elementor/utils';

export const ElementNotFoundError = createError< { elementId: string } >( {
	code: 'element_not_found',
	message: 'Element not found.',
} );

export const StyleNotFoundError = createError< { styleId: string } >( {
	code: 'style_not_found',
	message: 'Style not found.',
} );

export const ElementTypeNotExistsError = createError< { elementId: string } >( {
	code: 'element_type_not_exists',
	message: 'Element type does not exist.',
} );

export const ElementLabelNotExistsError = createError< { elementType: string } >( {
	code: 'element_label_not_exists',
	message: 'Element label does not exist.',
} );
