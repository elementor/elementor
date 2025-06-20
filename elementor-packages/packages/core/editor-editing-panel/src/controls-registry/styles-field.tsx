import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type PropKey, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

import { useStylesField } from '../hooks/use-styles-field';
import { StylesInheritanceIndicator } from '../styles-inheritance/components/styles-inheritance-indicator';
import { createTopLevelOjectType } from './create-top-level-object-type';

export type StylesFieldProps = {
	bind: PropKey;
	placeholder?: PropValue;
	children: React.ReactNode;
	propDisplayName: string;
};

export const StylesField = ( { bind, placeholder, children }: StylesFieldProps ) => {
	const { value, setValue, canEdit } = useStylesField( bind );

	const stylesSchema = getStylesSchema();

	const propType = createTopLevelOjectType( { schema: stylesSchema } );

	const values = { [ bind ]: value };
	const placeholderValues = { [ bind ]: placeholder };

	const setValues = ( newValue: Record< string, PropValue > ) => {
		setValue( newValue[ bind ] );
	};

	return (
		<ControlAdornmentsProvider
			items={ [
				{
					id: 'styles-inheritance',
					Adornment: StylesInheritanceIndicator,
				},
			] }
		>
			<PropProvider
				propType={ propType }
				value={ values }
				setValue={ setValues }
				placeholder={ placeholderValues }
				disabled={ ! canEdit }
			>
				<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
			</PropProvider>
		</ControlAdornmentsProvider>
	);
};
