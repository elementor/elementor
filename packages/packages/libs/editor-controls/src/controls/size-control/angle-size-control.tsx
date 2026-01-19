import * as React from 'react';
import { sizePropTypeUtil } from '@elementor/editor-props';

import { useBoundProp } from '../../bound-prop-context';
import { SizeInput } from '../../components/size-control/size-input';
import { TextFieldPopover } from '../../components/text-field-popover';
import { useSizeControlHandlers } from '../../hooks/use-size-control-handlers';
import { useSizeControlPopover } from '../../hooks/use-size-control-popover';
import { useSizeControlState } from '../../hooks/use-size-control-state';
import { useSizeControlUnits } from '../../hooks/use-size-control-units';
import { useSizeExtendedOptions } from '../../hooks/use-size-extended-options';
import { type AngleSizeControlProps } from './size-control-types';

export const AngleSizeControl = ( {
	defaultUnit,
	units,
	placeholder,
	startIcon,
	anchorRef,
	extendedOptions,
	disableCustom,
	min = 0,
	enablePropTypeUnits = false,
	id,
	ariaLabel,
}: Omit< AngleSizeControlProps, 'variant' > ) => {
	const {
		value: sizeValue,
		setValue: setSizeValue,
		disabled,
		restoreValue,
		placeholder: externalPlaceholder,
		propType,
	} = useBoundProp( sizePropTypeUtil );

	const actualExtendedOptions = useSizeExtendedOptions( extendedOptions || [], disableCustom ?? false );

	const { actualDefaultUnit, actualUnits } = useSizeControlUnits(
		'angle',
		propType,
		enablePropTypeUnits,
		units,
		actualExtendedOptions,
		defaultUnit,
		externalPlaceholder?.unit
	);

	const { state, setState, controlSize, controlUnit } = useSizeControlState(
		sizeValue,
		actualDefaultUnit,
		setSizeValue
	);

	const popupState = useSizeControlPopover();

	const { handleUnitChange, handleSizeChange, onInputClick } = useSizeControlHandlers(
		controlUnit,
		state,
		setState,
		popupState,
		anchorRef
	);

	return (
		<>
			<SizeInput
				disabled={ disabled }
				size={ controlSize }
				unit={ controlUnit }
				units={ actualUnits }
				placeholder={ placeholder }
				startIcon={ startIcon }
				handleSizeChange={ handleSizeChange }
				handleUnitChange={ handleUnitChange }
				onBlur={ restoreValue }
				onClick={ onInputClick }
				popupState={ popupState }
				min={ min }
				id={ id }
				ariaLabel={ ariaLabel }
			/>
			{ anchorRef?.current && popupState.isOpen ? (
				<TextFieldPopover
					popupState={ popupState }
					anchorRef={ anchorRef }
					restoreValue={ restoreValue }
					value={ controlSize as string }
					onChange={ handleSizeChange }
				/>
			) : null }
		</>
	);
};
