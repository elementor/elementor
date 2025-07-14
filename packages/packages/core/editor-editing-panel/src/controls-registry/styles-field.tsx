import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type PropKey, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { useStylesInheritanceChain } from '../contexts/styles-inheritance-context';
import { useStylesField } from '../hooks/use-styles-field';
import { StylesInheritanceIndicator } from '../styles-inheritance/components/styles-inheritance-indicator';
import { ConditionalField } from './conditional-field';
import { createTopLevelOjectType } from './create-top-level-object-type';

export type StylesFieldProps = {
	bind: PropKey;
	placeholder?: PropValue;
	children: React.ReactNode;
	propDisplayName: string;
};

export const StylesField = ( { bind, placeholder, propDisplayName, children }: StylesFieldProps ) => {
	const stylesSchema = getStylesSchema();

	const isVersion331Active = isExperimentActive( 'e_v_3_31' );

	const stylesInheritanceChain = useStylesInheritanceChain( [ bind ] );

	const { value, canEdit, ...fields } = useStylesField( bind, { history: { propDisplayName } } );

	const propType = createTopLevelOjectType( { schema: stylesSchema } );

	const [ actualValue ] = stylesInheritanceChain;

	const placeholderValues = {
		[ bind ]: isVersion331Active ? actualValue?.value : placeholder,
	};

	const setValue = ( newValue: Record< string, PropValue > ) => {
		fields.setValue( newValue[ bind ] );
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
				value={ { [ bind ]: value } }
				setValue={ setValue }
				placeholder={ placeholderValues }
				isDisabled={ () => ! canEdit }
			>
				<PropKeyProvider bind={ bind }>
					<ConditionalField>{ children }</ConditionalField>
				</PropKeyProvider>
			</PropProvider>
		</ControlAdornmentsProvider>
	);
};
