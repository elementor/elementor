import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { enqueueFont, ItemSelector, useFontFamilies } from '@elementor/editor-controls';
import { useSectionWidth } from '@elementor/editor-ui';
import { ChevronDownIcon, TextIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePopoverContentRef } from '../../context/variable-selection-popover.context';
import { validateValue } from '../../utils/validations';

type FontFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onValidationChange?: ( errorMessage: string ) => void;
};

export const FontField = ( { value, onChange, onValidationChange }: FontFieldProps ) => {
	const [ fontFamily, setFontFamily ] = useState( value );

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef.current;

	const fontPopoverState = usePopupState( { variant: 'popover' } );

	const fontFamilies = useFontFamilies();
	const sectionWidth = useSectionWidth();

	const mapFontSubs = React.useMemo( () => {
		return fontFamilies.map( ( { label, fonts } ) => ( {
			label,
			items: fonts,
		} ) );
	}, [ fontFamilies ] );

	const handleChange = ( newValue: string ) => {
		setFontFamily( newValue );

		const errorMsg = validateValue( newValue );
		onValidationChange?.( errorMsg );

		onChange( errorMsg ? '' : newValue );
	};

	const handleFontFamilyChange = ( newFontFamily: string ) => {
		handleChange( newFontFamily );
		fontPopoverState.close();
	};

	const id = useId();

	return (
		<>
			<UnstableTag
				id={ id }
				variant="outlined"
				label={ fontFamily }
				endIcon={ <ChevronDownIcon fontSize="tiny" /> }
				{ ...bindTrigger( fontPopoverState ) }
				fullWidth
			/>
			<Popover
				disablePortal
				disableScrollLock
				anchorEl={ anchorRef }
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: -28 } }
				{ ...bindPopover( fontPopoverState ) }
			>
				<ItemSelector
					id="font-family-variables-selector"
					itemsList={ mapFontSubs }
					selectedItem={ fontFamily }
					onItemChange={ handleFontFamilyChange }
					onClose={ fontPopoverState.close }
					sectionWidth={ sectionWidth }
					title={ __( 'Font family', 'elementor' ) }
					itemStyle={ ( item ) => ( { fontFamily: item.value } ) }
					onDebounce={ enqueueFont }
					icon={ TextIcon as React.ElementType< { fontSize: string } > }
				/>
			</Popover>
		</>
	);
};
