import { createError } from '@elementor/utils';

export const MissingPropTypeError = createError( {
	code: 'missing_prop_provider_prop_type',
	message: 'Prop type is missing',
} );

export const UnsupportedParentError = createError( {
	code: 'unsupported_prop_provider_prop_type',
	message: 'Parent prop type is not supported',
} );

export const HookOutsideProviderError = createError( {
	code: 'hook_outside_provider',
	message: 'Hook used outside of provider',
} );
