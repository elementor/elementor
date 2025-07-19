import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type PropKey, type PropType, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

import { useStylesInheritanceChain } from '../contexts/styles-inheritance-context';
import { useStylesFields } from '../hooks/use-styles-fields';
import { StylesInheritanceIndicator } from '../styles-inheritance/components/styles-inheritance-indicator';
import { ConditionalField, getDependencies } from './conditional-field';
import { createTopLevelOjectType } from './create-top-level-object-type';
import { getDisableState } from './get-dependency-state';

export type StylesFieldProps = {
	bind: PropKey;
	placeholder?: PropValue;
	children: React.ReactNode;
	propDisplayName: string;
};

export const StylesField = ( { bind, propDisplayName, children }: StylesFieldProps ) => {
	const stylesSchema = getStylesSchema();
	const depList = getDependencies( stylesSchema[ bind ] );

	const stylesInheritanceChain = useStylesInheritanceChain( [ bind ] );

	const { values, setValues, canEdit } = useStylesFields( [ ...depList, bind ] );

	const { [ bind ]: value, ...depValues } = values ?? {};

	const propType = createTopLevelOjectType( { schema: stylesSchema } );

	const [ actualValue ] = stylesInheritanceChain;

	const placeholderValues = {
		[ bind ]: actualValue?.value,
	};

	const setValue = ( newValue: Record< string, PropValue > ) => {
		setValues(
			{ [ bind ]: newValue[ bind ] },
			{
				history: { propDisplayName },
			}
		);
	};

	const isDisabled = ( pt: PropType ) => {
		if ( ! canEdit ) {
			return true;
		}

		return getDisableState( pt, depValues );
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
				isDisabled={ isDisabled }
			>
				<PropKeyProvider bind={ bind }>
					<ConditionalField>{ children }</ConditionalField>
				</PropKeyProvider>
			</PropProvider>
		</ControlAdornmentsProvider>
	);
};
