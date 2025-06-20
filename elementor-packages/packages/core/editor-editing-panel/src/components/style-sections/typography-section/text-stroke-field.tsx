import * as React from 'react';
import { StrokeControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { AddOrRemoveContent } from '../../add-or-remove-content';
import { ControlLabel } from '../../control-label';

const initTextStroke = {
	$$type: 'stroke',
	value: {
		color: {
			$$type: 'color',
			value: '#000000',
		},
		width: {
			$$type: 'size',
			value: {
				unit: 'px',
				size: 1,
			},
		},
	},
};

const TEXT_STROKE_LABEL = __( 'Text stroke', 'elementor' );

export const TextStrokeField = () => {
	const { value, setValue, canEdit } = useStylesField( 'stroke' );

	const addTextStroke = () => {
		setValue( initTextStroke );
	};

	const removeTextStroke = () => {
		setValue( null );
	};

	const hasTextStroke = Boolean( value );

	return (
		<StylesField bind={ 'stroke' } propDisplayName={ TEXT_STROKE_LABEL }>
			<AddOrRemoveContent
				isAdded={ hasTextStroke }
				onAdd={ addTextStroke }
				onRemove={ removeTextStroke }
				disabled={ ! canEdit }
				renderLabel={ () => <ControlLabel>{ TEXT_STROKE_LABEL }</ControlLabel> }
			>
				<StrokeControl />
			</AddOrRemoveContent>
		</StylesField>
	);
};
