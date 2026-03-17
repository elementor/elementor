import * as React from 'react';
import type { RefObject } from 'react';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { useBoundProp } from '../../bound-prop-context';
import ControlActions from '../../control-actions/control-actions';
import { createControl } from '../../create-control';
import { SizeComponent } from './size-component';
import { type SizeVariant } from './types';
import { resolveBoundPropValue } from './utils/resolve-bound-prop-value';
import { getDefaultUnit } from './utils/settings/get-default-unit';
import { getSizeUnits } from './utils/settings/get-size-units';
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

		const units = getSizeUnits( propType, variant );
		const defaultUnit = getDefaultUnit( propType );

		const handleBlur = () => {
			const isRequired = propType.settings.required;

			if ( shouldNullifyValue( value ) && ! isRequired ) {
				setValue( null );
			}

			if ( isRequired ) {
				restoreValue();
			}
		};

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
