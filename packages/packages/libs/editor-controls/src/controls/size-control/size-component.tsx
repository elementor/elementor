import * as React from 'react';
import { type RefObject, useEffect } from 'react';
import type { SizePropValue } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { Box, usePopupState } from '@elementor/ui';

import { SizeField, type SizeFieldProps } from './size-field';
import { TextFieldPopover } from './ui/text-field-popover';
import { EXTENDED_UNITS } from './utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type SizeUnit = SizePropValue[ 'value' ][ 'unit' ];

type Props = SizeFieldProps< SizeValue, SizeUnit > & {
	anchorRef?: RefObject< HTMLDivElement | null >;
	isUnitActive?: boolean;
	SizeFieldWrapper?: React.ComponentType< { children: React.ReactNode } >;
};

export const SizeComponent = ( {
	anchorRef,
	isUnitActive,
	SizeFieldWrapper = React.Fragment,
	...sizeFieldProps
}: Props ) => {
	const popupState = usePopupState( { variant: 'popover' } );
	const activeBreakpoint = useActiveBreakpoint();

	const isCustomUnit = sizeFieldProps?.value?.unit === EXTENDED_UNITS.custom;
	const hasCustomUnitOption = sizeFieldProps.units.includes( EXTENDED_UNITS.custom );

	useEffect( () => {
		if ( popupState && popupState.isOpen ) {
			popupState.close();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint ] );

	const handleCustomSizeChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		sizeFieldProps.onChange( {
			size: event.target.value,
			unit: EXTENDED_UNITS.custom,
		} );
	};

	const handleSizeFieldClick = ( event: React.MouseEvent ) => {
		if ( ( event.target as HTMLElement ).closest( 'input' ) && isCustomUnit ) {
			popupState.open( anchorRef?.current );
		}
	};

	const handleUnitChange = ( unit: SizeUnit ) => {
		if ( unit === EXTENDED_UNITS.custom && anchorRef?.current ) {
			popupState.open( anchorRef.current );
		}
	};

	const popupAttributes = {
		'aria-controls': popupState.isOpen ? popupState.popupId : undefined,
		'aria-haspopup': true,
	};

	return (
		<>
			<SizeFieldWrapper>
				<Box>
					<SizeField
						{ ...sizeFieldProps }
						onUnitChange={ handleUnitChange }
						InputProps={ {
							...popupAttributes,
							onClick: handleSizeFieldClick,
						} }
						unitSelectorProps={ {
							menuItemsAttributes: hasCustomUnitOption ? { custom: popupAttributes } : undefined,
							isActive: isUnitActive,
						} }
					/>
				</Box>
			</SizeFieldWrapper>
			{ popupState.isOpen && anchorRef?.current && (
				<TextFieldPopover
					popupState={ popupState }
					anchorRef={ anchorRef as RefObject< HTMLDivElement > }
					value={ String( sizeFieldProps?.value?.size ?? '' ) }
					onChange={ handleCustomSizeChange }
					onClose={ () => {} }
				/>
			) }
		</>
	);
};
