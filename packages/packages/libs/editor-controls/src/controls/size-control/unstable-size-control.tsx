import * as React from 'react';
import type { RefObject } from 'react';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { useBoundProp } from '../../bound-prop-context';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';
import { SizeComponent } from './size-component';
import { type SizeVariant } from './types';
import { getDefaultUnit } from './utils/settings/get-default-unit';
import { getSizeUnits } from './utils/settings/get-size-units';
import { resolveBoundPropValue } from './utils/resolve-bound-prop-value';
import { shouldNullifyValue } from './utils/should-nullify-value';

type Props = {
	placeholder?: string;
	variant?: SizeVariant;
	anchorRef?: RefObject< HTMLDivElement | null >;
};

export const UnstableSizeControl = createControl(
	( { variant = 'length', placeholder: propPlaceholder, anchorRef }: Props ) => {
		const {
			value,
			setValue,
			propType,
			placeholder: boundPropPlaceholder,
			restoreValue,
		} = useBoundProp( sizePropTypeUtil );

		const { sizeValue, isUnitActive, placeholder } = resolveBoundPropValue(
			value,
			boundPropPlaceholder,
			propPlaceholder
		);

		const units = getSizeUnits( variant, propType );
		const defaultUnit = getDefaultUnit( propType );

		// We need to write this code with clarity to really describe whats happening
		// If its required we want to restore the prev value && if not set it to null
		const handleBlur = () => {
			const isRequired = propType.settings.required;

			if ( shouldNullifyValue( value ) && ! isRequired ) {
				setValue( null );
			}

			if ( isRequired ) {
				restoreValue();
			}
		};

		// what time should we set false;
		// when required is true and size === ''
		// Study more this condition to have better understanding
		// Why was there inoput validation here
		const handleChange = ( newValue: SizePropValue[ 'value' ] ) => {
			setValue( newValue, undefined, {
				validation: () => {
					return ! ( newValue.size === '' && propType.settings.required );
				},
			} );
		};

		return (
			<SizeComponent
				units={ units }
				value={ sizeValue }
				anchorRef={ anchorRef }
				placeholder={ placeholder }
				defaultUnit={ defaultUnit }
				isUnitActive={ isUnitActive }
				onBlur={ handleBlur }
				onChange={ handleChange }
				SizeFieldWrapper={ ControlActions }
			/>
		);
	}
);
// set null here if size is empty string, or null or undefined
// value={ { size: value?.size, unit: value?.unit ?? placeholder?.unit ?? '' } } // i dont like this i need distribution of responsibility

// Popover open for custom open when rendered
// Box
