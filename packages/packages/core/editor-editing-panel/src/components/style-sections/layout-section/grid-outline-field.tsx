import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { StylesFieldLayout } from '../../styles-field-layout';
import { Box, Switch } from '@elementor/ui';
import { useElement } from '../../../contexts/element-context';
import { updateElementEditorSettings, useElementEditorSettings } from '@elementor/editor-elements';

const GRID_OUTLINE_LABEL = __( 'Show Grid Outline', 'elementor' );

export const GridOutlineField = () => {
	const { element } = useElement();
	const settings = useElementEditorSettings( element.id );
	const value = settings?.grid_outline ?? true;

	return (
			<StylesFieldLayout label={ GRID_OUTLINE_LABEL }>
				<Box sx={ { display: 'flex', justifyContent: 'flex-end' } }>
					<Switch
						checked={ !! value }
						onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
							updateElementEditorSettings( {
								elementId: element.id,
								settings: { grid_outline: event.target.checked },
							} );
						} }
						size="small"
					/>
			</Box>
		</StylesFieldLayout>
	);
};
