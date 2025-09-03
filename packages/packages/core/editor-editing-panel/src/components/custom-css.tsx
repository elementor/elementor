import * as React from 'react';
import { ControlAdornments, ControlFormLabel, CssEditor } from '@elementor/editor-controls';
import { SectionContent, useCustomCss } from '@elementor/editor-editing-panel';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CustomCssField } from './custom-css-field';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();
	const [ localState, setLocalState ] = React.useState( {
		value: customCss?.raw || '',
		isValid: true,
	} );

	const handleChange = ( value: string, isValid: boolean ) => {
		setLocalState( { value, isValid } );

		if ( isValid ) {
			setCustomCss( value, { history: { propDisplayName: 'Custom CSS' } } );
		}
	};

	return (
		<SectionContent>
			<CustomCssField>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<ControlFormLabel>{ __( 'CSS code', 'elementor-pro' ) }</ControlFormLabel>
					<ControlAdornments />
				</Stack>
			</CustomCssField>
			<CssEditor value={ localState.value } onChange={ handleChange } />
		</SectionContent>
	);
};
