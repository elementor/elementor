import * as React from 'react';
import { useRef, useState } from 'react';
import { enqueueFont, ItemSelector } from '@elementor/editor-controls';
import { useFontFamilies, useSectionWidth } from '@elementor/editor-editing-panel';
import { ChevronDownIcon, TextIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	FormHelperText,
	FormLabel,
	Grid,
	Popover,
	UnstableTag,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { validateValue } from '../../utils/validations';
import { usePopoverContentRef } from '../variable-selection-popover.context';

type FontFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

export const FontField = ( { value, onChange }: FontFieldProps ) => {
	const [ fontFamily, setFontFamily ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

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
		setErrorMessage( errorMsg );

		onChange( errorMsg ? '' : newValue );
	};

	const handleFontFamilyChange = ( newFontFamily: string ) => {
		handleChange( newFontFamily );
		fontPopoverState.close();
	};

	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel size="tiny">{ __( 'Value', 'elementor' ) }</FormLabel>
			</Grid>
			<Grid item xs={ 12 }>
				<UnstableTag
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
						itemsList={ mapFontSubs }
						selectedItem={ fontFamily }
						onItemChange={ handleFontFamilyChange }
						onClose={ fontPopoverState.close }
						sectionWidth={ sectionWidth }
						title={ __( 'Font Family', 'elementor' ) }
						itemStyle={ ( item ) => ( { fontFamily: item.value } ) }
						onDebounce={ enqueueFont }
						icon={ TextIcon as React.ElementType< { fontSize: string } > }
					/>
				</Popover>
				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
			</Grid>
		</Grid>
	);
};
