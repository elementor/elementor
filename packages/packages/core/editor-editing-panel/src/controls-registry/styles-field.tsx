import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type PropKey, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { useStylesInheritanceChain } from '../contexts/styles-inheritance-context';
import { useStylesField } from '../hooks/use-styles-field';
import { StylesInheritanceIndicator } from '../styles-inheritance/components/styles-inheritance-indicator';
import { createTopLevelOjectType } from './create-top-level-object-type';

export type StylesFieldProps = {
	bind: PropKey;
	placeholder?: PropValue;
	children: React.ReactNode;
	propDisplayName: string;
};

export const StylesField = ( { bind, placeholder, propDisplayName, children }: StylesFieldProps ) => {
	const { value, setValue, canEdit } = useStylesField( bind, {
		history: { propDisplayName },
	} );

	const isVersion331Active = isExperimentActive( 'e_v_3_31' );
	const stylesInheritanceChain = useStylesInheritanceChain( [ bind ] );

	const stylesSchema = getStylesSchema();

	const propType = createTopLevelOjectType( { schema: stylesSchema } );

	const values = { [ bind ]: value };
	const [ actualValue ] = stylesInheritanceChain;
	const placeholderValues = {
		[ bind ]: isVersion331Active ? actualValue?.value : placeholder,
	};
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
				isDisabled={ () => ! canEdit }
			>
				<PropKeyProvider bind={ bind }>{ children }</PropKeyProvider>
			</PropProvider>
		</ControlAdornmentsProvider>
	);
};
