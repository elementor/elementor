import * as React from 'react';
import { type RefObject, useEffect, useRef } from 'react';
import { ExternalLinkIcon } from '@elementor/icons';
import { bindPopover, Popover, type PopupState, Stack, TextField, ToggleButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLDivElement | null >;
	restoreValue: () => void;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
};

export const UrlPopover = ( { popupState, restoreValue, anchorRef, value, onChange }: Props ) => {
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		if ( popupState.isOpen ) {
			requestAnimationFrame( () => inputRef.current?.focus() );
		}
	}, [ popupState.isOpen ] );

	const handleClose = () => {
		restoreValue();
		popupState.close();
	};

	return (
		<Popover
			disablePortal
			slotProps={ { paper: { sx: { borderRadius: 2, width: anchorRef.current?.offsetWidth + 'px' } } } }
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'top', horizontal: 'center' } }
			transformOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			onClose={ handleClose }
		>
			<Stack direction="row" alignItems="center" gap={ 0.5 } sx={ { p: 1.5 } }>
				<TextField
					value={ value }
					onChange={ onChange }
					size="tiny"
					fullWidth
					placeholder={ __( 'Type a URL', 'elementor' ) }
					inputProps={ { ref: inputRef } }
				/>
				<ToggleButton
					size="tiny"
					onClick={ () => window.open( value, '_blank' ) }
					disabled={ ! value }
					aria-label={ __( 'Open URL', 'elementor' ) }
				>
					<ExternalLinkIcon fontSize="tiny" />
				</ToggleButton>
			</Stack>
		</Popover>
	);
};
