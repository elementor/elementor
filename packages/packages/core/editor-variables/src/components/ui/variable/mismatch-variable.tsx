import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { Backdrop, bindPopover, Box, Infotip, Popover, usePopupState } from '@elementor/ui';

import { type Variable } from '../../../types';
import { VariableSelectionPopover } from '../../variable-selection-popover';
import { MismatchVariableAlert } from '../mismatch-variable-alert';
import { MismatchTag } from '../tags/mismatch-tag';

type Props = {
	variable: Variable;
};

export const MismatchVariable = ( { variable }: Props ) => {
	const { setValue } = useBoundProp();

	const anchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-list-${ popupId }`,
	} );

	const [ infotipVisible, setInfotipVisible ] = useState( false );

	const toggleInfotip = () => setInfotipVisible( ( prev ) => ! prev );
	const closeInfotip = () => setInfotipVisible( false );

	const triggerSelect = () => {
		closeInfotip();

		popupState.setAnchorEl( anchorRef.current );
		popupState.open();
	};

	const clearValue = () => {
		closeInfotip();
		setValue( null );
	};

	return (
		<Box ref={ anchorRef }>
			{ infotipVisible && <Backdrop open onClick={ closeInfotip } invisible /> }
			<Infotip
				color="warning"
				placement="right-start"
				open={ infotipVisible }
				disableHoverListener
				onClose={ closeInfotip }
				content={
					<MismatchVariableAlert
						onClose={ closeInfotip }
						onClear={ clearValue }
						triggerSelect={ triggerSelect }
					/>
				}
				slotProps={ {
					popper: {
						modifiers: [
							{
								name: 'offset',
								options: { offset: [ 0, 24 ] },
							},
						],
					},
				} }
			>
				<MismatchTag label={ variable.label } onClick={ toggleInfotip } />
			</Infotip>

			<Popover
				disableScrollLock
				anchorEl={ anchorRef.current }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				PaperProps={ {
					sx: { my: 1 },
				} }
				{ ...bindPopover( popupState ) }
			>
				<VariableSelectionPopover
					selectedVariable={ variable }
					closePopover={ popupState.close }
					propTypeKey={ variable.type }
				/>
			</Popover>
		</Box>
	);
};
