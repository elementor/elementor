import * as React from 'react';
import { type RefObject, useEffect, useRef } from 'react';
import { bindPopover, Popover, type PopupState, TextField } from '@elementor/ui';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLDivElement | null >;
	restoreValue: () => void;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
};

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

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: {
						borderRadius: 2,
						width: anchorRef.current?.offsetWidth + 'px',
						p: 1.5,
					},
				},
			} }
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			transformOrigin={ { vertical: 'top', horizontal: 'center' } }
			onClose={ () => {
				restoreValue();
				popupState.close();
			} }
		>
			<TextField
				value={ value }
				onChange={ onChange }
				size="tiny"
				type="text"
				fullWidth
				inputProps={ {
					ref: inputRef,
				} }
			/>
		</Popover>
	);
};
