import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useStylesFields } from '../../../hooks/use-styles-fields';
import { AddOrRemoveContent } from '../../add-or-remove-content';
import { BorderColorField } from './border-color-field';
import { BorderStyleField } from './border-style-field';
import { BorderWidthField } from './border-width-field';

const BORDER_LABEL = __( 'Border', 'elementor' );

const initialBorder = {
	'border-width': { $$type: 'size', value: { size: 1, unit: 'px' } },
	'border-color': { $$type: 'color', value: '#000000' },
	'border-style': { $$type: 'string', value: 'solid' },
};

export const BorderField = () => {
	const { values, setValues, canEdit } = useStylesFields( Object.keys( initialBorder ) );

	const meta = { history: { propDisplayName: BORDER_LABEL } };

	const addBorder = () => {
		setValues( initialBorder, meta );
	};

	const removeBorder = () => {
		setValues(
			{
				'border-width': null,
				'border-color': null,
				'border-style': null,
			},
			meta
		);
	};

	const hasBorder = Object.values( values ?? {} ).some( Boolean );

	return (
		<AddOrRemoveContent
			isAdded={ hasBorder }
			onAdd={ addBorder }
			onRemove={ removeBorder }
			disabled={ ! canEdit }
			renderLabel={ () => <ControlFormLabel>{ BORDER_LABEL }</ControlFormLabel> }
		>
			<BorderWidthField />
			<BorderColorField />
			<BorderStyleField />
		</AddOrRemoveContent>
	);
};
