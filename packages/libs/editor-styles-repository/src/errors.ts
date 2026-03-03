import { createError } from '@elementor/utils';

export const InvalidElementsStyleProviderMetaError = createError< { meta: Record< string, unknown > } >( {
	code: 'invalid_elements_style_provider_meta',
	message: 'Invalid elements style provider meta.',
} );

export const ActiveDocumentMustExistError = createError( {
	code: 'active_document_must_exist',
	message: 'Active document must exist.',
} );
