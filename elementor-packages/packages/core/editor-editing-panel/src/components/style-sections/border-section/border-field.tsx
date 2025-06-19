import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useStylesFields } from '../../../hooks/use-styles-fields';
import { AddOrRemoveContent } from '../../add-or-remove-content';
import { BorderColorField } from './border-color-field';
import { BorderStyleField } from './border-style-field';
import { BorderWidthField } from './border-width-field';

const initialBorder = {
	'border-width': { $$type: 'size', value: { size: 1, unit: 'px' } },
	'border-color': { $$type: 'color', value: '#000000' },
	'border-style': { $$type: 'string', value: 'solid' },
};

export const BorderField = () => {
	const { values, setValues, canEdit } = useStylesFields( Object.keys( initialBorder ) );

	const addBorder = () => {
		setValues( initialBorder );
	};

	const removeBorder = () => {
		setValues( {
			'border-width': null,
			'border-color': null,
			'border-style': null,
		} );
	};

	const hasBorder = Object.values( values ?? {} ).some( Boolean );

	return (
		<AddOrRemoveContent
			isAdded={ hasBorder }
			onAdd={ addBorder }
			onRemove={ removeBorder }
			disabled={ ! canEdit }
			renderLabel={ () => <ControlFormLabel>{ __( 'Border', 'elementor' ) }</ControlFormLabel> }
		>
			<BorderWidthField />
			<BorderColorField />
			<BorderStyleField />
		</AddOrRemoveContent>
	);
};
