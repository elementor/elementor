import * as React from 'react';
import { useRef, useState } from 'react';
import { FontFamilySelector, PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { useFontFamilies, useSectionRef } from '@elementor/editor-editing-panel';
import { PopoverHeader, PopoverScrollableContent } from '@elementor/editor-ui';
import { ArrowLeftIcon, ChevronDownIcon, TextIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Button,
	CardActions,
	Divider,
	FormLabel,
	Grid,
	IconButton,
	Popover,
	TextField,
	UnstableTag,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';

const SIZE = 'tiny';

type Props = {
	onGoBack?: () => void;
	onClose: () => void;
};

export const FontVariableCreation = ( { onClose, onGoBack }: Props ) => {
	const fontFamilies = useFontFamilies();
	const { setValue: setVariable } = useBoundProp( fontVariablePropTypeUtil );

	const [ fontFamily, setFontFamily ] = useState( '' );
	const [ label, setLabel ] = useState( '' );

	const anchorRef = useRef< HTMLDivElement >( null );
	const fontPopoverState = usePopupState( { variant: 'popover' } );

	const resetFields = () => {
		setFontFamily( '' );
		setLabel( '' );
	};

	const closePopover = () => {
		resetFields();
		onClose();
	};

	const handleCreate = () => {
		createVariable( {
			value: fontFamily,
			label,
			type: fontVariablePropTypeUtil.key,
		} ).then( ( key ) => {
			setVariable( key );
			closePopover();
		} );
	};

	const isFormInvalid = () => {
		return ! fontFamily?.trim() || ! label?.trim();
	};

	const sectionRef = useSectionRef();
	const sectionWidth = sectionRef?.current?.offsetWidth ?? 320;

	return (
		<PopoverScrollableContent height="auto" width={ sectionWidth }>
			<PopoverHeader
				icon={
					<>
						{ onGoBack && (
							<IconButton size={ SIZE } aria-label={ __( 'Go Back', 'elementor' ) } onClick={ onGoBack }>
								<ArrowLeftIcon fontSize={ SIZE } />
							</IconButton>
						) }
						<TextIcon fontSize={ SIZE } />
					</>
				}
				title={ __( 'Create variable', 'elementor' ) }
				onClose={ closePopover }
			/>

			<Divider />

			<PopoverContent p={ 2 }>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ __( 'Name', 'elementor' ) }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<TextField
							size="tiny"
							fullWidth
							value={ label }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setLabel( e.target.value ) }
						/>
					</Grid>
				</Grid>

				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ __( 'Value', 'elementor' ) }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<>
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
								anchorEl={ anchorRef.current }
								anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
								transformOrigin={ { vertical: 'top', horizontal: -20 } }
								{ ...bindPopover( fontPopoverState ) }
							>
								<FontFamilySelector
									fontFamilies={ fontFamilies }
									fontFamily={ fontFamily }
									onFontFamilyChange={ setFontFamily }
									onClose={ fontPopoverState.close }
									sectionWidth={ sectionWidth }
								/>
							</Popover>
						</>
					</Grid>
				</Grid>
			</PopoverContent>

			<CardActions sx={ { pt: 0.5, pb: 1 } }>
				<Button size="small" variant="contained" disabled={ isFormInvalid() } onClick={ handleCreate }>
					{ __( 'Create', 'elementor' ) }
				</Button>
			</CardActions>
		</PopoverScrollableContent>
	);
};
