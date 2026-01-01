import { __getState as getState } from '@elementor/store';

import { createSubmitComponentSchema } from '../components/create-component-form/utils/component-form-schema';
import { selectComponents } from '../store/store';

type ValidationResult = { isValid: true; errorMessage: null } | { isValid: false; errorMessage: string };

export function validateComponentName( label: string ): ValidationResult {
	const existingComponentTitles = selectComponents( getState() )?.map( ( { name } ) => name ) ?? [];
	const schema = createSubmitComponentSchema( existingComponentTitles );
	const result = schema.safeParse( { componentName: label.toLowerCase() } );

	if ( result.success ) {
		return {
			isValid: true,
			errorMessage: null,
		};
	}

	const formattedErrors = result.error.format();
	const errorMessage = formattedErrors.componentName?._errors[ 0 ] ?? formattedErrors._errors[ 0 ];

	return {
		isValid: false,
		errorMessage,
	};
}
