import * as React from 'react';
import { type RefObject, useEffect, useRef } from 'react';
import { PopoverHeader } from '@elementor/editor-ui';
import { MathFunctionIcon } from '@elementor/icons';
import { bindPopover, Popover, type PopupState, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLDivElement | null >;
	restoreValue: () => void;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
};

const SIZE = 'tiny';

export const TextFieldPopover = ( props: Props ) => {
	const { popupState, restoreValue, anchorRef, value, onChange } = props;
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		if ( popupState.isOpen ) {
			requestAnimationFrame( () => {
				if ( inputRef.current ) {
					inputRef.current.focus();
				}
			} );
		}
	}, [ popupState.isOpen ] );

	const handleClose = () => {
		restoreValue();
		popupState.close();
	};

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: {
						borderRadius: 2,
						width: anchorRef.current?.offsetWidth + 'px',
					},
				},
			} }
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			transformOrigin={ { vertical: 'top', horizontal: 'center' } }
			onClose={ handleClose }
		>
			<PopoverHeader
				title={ __( 'CSS function', 'elementor' ) }
				onClose={ handleClose }
				icon={ <MathFunctionIcon fontSize={ SIZE } /> }
			/>
			<TextField
				value={ value }
				onChange={ onChange }
				size="tiny"
				type="text"
				fullWidth
				inputProps={ {
					ref: inputRef,
				} }
				sx={ { pt: 0, pr: 1.5, pb: 1.5, pl: 1.5 } }
			/>
		</Popover>
	);
};
