import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { updateElementEditorSettings, useElementEditorSettings } from '@elementor/editor-elements';
import { Stack, Switch } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';

const LABEL = __( 'Show grid outline', 'elementor' );

export const GridOutlineField = () => {
	const { element } = useElement();
	const editorSettings = useElementEditorSettings( element.id );
	const checked = editorSettings?.grid_outline !== false;

	const handleChange = ( _: React.ChangeEvent< HTMLInputElement >, value: boolean ) => {
		updateElementEditorSettings( {
			elementId: element.id,
			settings: { grid_outline: value },
		} );
	};

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between" gap={ 1 }>
			<ControlFormLabel>{ LABEL }</ControlFormLabel>
			<Switch size="small" checked={ checked } onChange={ handleChange } inputProps={ { 'aria-label': LABEL } } />
		</Stack>
	);
};
