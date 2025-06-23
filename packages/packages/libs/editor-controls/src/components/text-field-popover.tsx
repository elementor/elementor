import * as React from 'react';
import { type RefObject } from 'react';
import { bindPopover, Paper, Popover, type PopupState, TextField } from '@elementor/ui';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLDivElement | null >;
	restoreValue: () => void;
	value: string;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
};

export const TextFieldPopover = ( props: Props ) => {
	const { popupState, restoreValue, anchorRef, value, onChange } = props;

	return (
		<Popover
			disablePortal
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			transformOrigin={ { vertical: 'top', horizontal: 'center' } }
			onClose={ () => {
				restoreValue();
				popupState.close();
			} }
		>
			<Paper
				sx={ {
					width: anchorRef.current?.offsetWidth + 'px',
					borderRadius: 2,
					p: 1.5,
				} }
			>
				<TextField
					value={ value }
					onChange={ onChange }
					size="tiny"
					type="text"
					fullWidth
					inputProps={ {
						autoFocus: true,
					} }
				/>
			</Paper>
		</Popover>
	);
};
