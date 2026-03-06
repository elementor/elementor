import * as React from 'react';
import { type RefObject, useEffect } from 'react';
import type { SizePropValue } from '@elementor/editor-props';
import { usePopupState } from '@elementor/ui';

import { SizeField, type SizeFieldProps } from './size-field';
import { TextFieldPopover } from './ui/text-field-popover';
import { EXTENDED_UNITS } from './utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type SizeUnit = SizePropValue[ 'value' ][ 'unit' ];

type Props = SizeFieldProps< SizeValue, SizeUnit > & {
	anchorRef?: RefObject< HTMLDivElement | null >;
};

export const SizeComponent = ( { anchorRef, ...sizeFieldProps }: Props ) => {
	const popupState = usePopupState( { variant: 'popover' } );

	const isCustomUnit = sizeFieldProps?.value?.unit === EXTENDED_UNITS.custom;
	const hasCustomUnitOption = sizeFieldProps.units.includes( EXTENDED_UNITS.custom );

	useEffect( () => {
		if ( isCustomUnit && anchorRef?.current && ! popupState.isOpen ) {
			popupState.open( anchorRef?.current );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isCustomUnit ] );

	const handleSizeChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		sizeFieldProps.onChange( {
			size: event.target.value,
			unit: EXTENDED_UNITS.custom,
		} );
	};

	const handleInputClick = ( event: React.MouseEvent ) => {
		if ( ( event.target as HTMLElement ).closest( 'input' ) && isCustomUnit ) {
			popupState.open( anchorRef?.current );
		}
	};

	const popupAttributes = {
		'aria-controls': popupState.isOpen ? popupState.popupId : undefined,
		'aria-haspopup': true,
	};

	return (
		<>
			<SizeField
				{ ...sizeFieldProps }
				InputProps={ {
					...popupAttributes,
					onClick: handleInputClick,
				} }
				unitSelectorProps={ {
					menuItemsAttributes: hasCustomUnitOption ? { custom: popupAttributes } : undefined,
				} }
			/>
			{ popupState.isOpen && anchorRef?.current && (
				<TextFieldPopover
					popupState={ popupState }
					anchorRef={ anchorRef as RefObject< HTMLDivElement > }
					value={ String( sizeFieldProps?.value?.size ?? '' ) }
					onChange={ handleSizeChange }
					onClose={ () => {} }
				/>
			) }
		</>
	);
};
