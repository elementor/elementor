import * as React from 'react';
import { type RefObject, useEffect, useRef } from 'react';
import { ExternalLinkIcon } from '@elementor/icons';
import { bindPopover, Popover, type PopupState, Stack, TextField, ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLDivElement | null >;
	restoreValue: () => void;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	openInNewTab: boolean;
	onToggleNewTab: () => void;
};

export const UrlPopover = ( {
	popupState,
	restoreValue,
	anchorRef,
	value,
	onChange,
	openInNewTab,
	onToggleNewTab,
}: Props ) => {
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
			slotProps={ {
				paper: { sx: { borderRadius: '16px', width: anchorRef.current?.offsetWidth + 'px', marginTop: -1 } },
			} }
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'top', horizontal: 'left' } }
			transformOrigin={ { vertical: 'top', horizontal: 'left' } }
			onClose={ handleClose }
		>
			<Stack direction="row" alignItems="center" gap={ 1 } sx={ { p: 1.5 } }>
				<TextField
					value={ value }
					onChange={ onChange }
					size="tiny"
					fullWidth
					placeholder={ __( 'Type a URL', 'elementor' ) }
					inputProps={ { ref: inputRef } }
					color="secondary"
					InputProps={ { sx: { borderRadius: '8px' } } }
					onKeyUp={ ( event: React.KeyboardEvent< HTMLInputElement > ) =>
						event.key === 'Enter' && handleClose()
					}
				/>
				<Tooltip title={ __( 'Open in a new tab', 'elementor' ) }>
					<ToggleButton
						size="tiny"
						value="newTab"
						selected={ openInNewTab }
						onClick={ onToggleNewTab }
						aria-label={ __( 'Open in a new tab', 'elementor' ) }
						sx={ { borderRadius: '8px' } }
					>
						<ExternalLinkIcon fontSize="tiny" />
					</ToggleButton>
				</Tooltip>
			</Stack>
		</Popover>
	);
};
