import { type StyleDefinitionID } from '@elementor/editor-styles';
import { createError } from '@elementor/utils';

export const ControlTypeNotFoundError = createError< { controlType: string } >( {
	code: 'control_type_not_found',
	message: 'Control type not found.',
} );

export const StylesProviderNotFoundError = createError< { styleId: StyleDefinitionID } >( {
	code: 'provider_not_found',
	message: 'Styles provider not found.',
} );

export const StylesProviderCannotUpdatePropsError = createError< { providerKey: string } >( {
	code: 'provider_cannot_update_props',
	message: "Styles provider doesn't support updating props.",
} );

export const StyleNotFoundUnderProviderError = createError< { styleId: StyleDefinitionID; providerKey: string } >( {
	code: 'style_not_found_under_provider',
	message: 'Style not found under the provider.',
} );
