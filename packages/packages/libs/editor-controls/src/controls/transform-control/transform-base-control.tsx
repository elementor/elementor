import * as React from 'react';
import { useRef } from 'react';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Divider, IconButton, Popover, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { TransformOriginControl } from './transform-base-controls/transform-origin-control';

const SIZE = 'tiny';

export const TransformBaseControl = ( { anchorRef }: { anchorRef: React.RefObject< HTMLDivElement | null > } ) => {
	const rowRef = useRef< HTMLDivElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );
	const popupProps = bindPopover( {
		...popupState,
		anchorEl: anchorRef.current ?? undefined,
	} );

	return (
		<>
			<IconButton
				size={ SIZE }
				aria-label={ __( 'Base Transform', 'elementor' ) }
				{ ...bindTrigger( popupState ) }
			>
				<AdjustmentsIcon fontSize={ SIZE } />
			</IconButton>
			<Popover
				disablePortal
				slotProps={ {
					paper: {
						sx: {
							width: anchorRef.current?.offsetWidth + 'px',
						},
					},
				} }
				{ ...popupProps }
			>
				<PopoverHeader
					title={ __( 'Base Transform', 'elementor' ) }
					onClose={ popupState.close }
					icon={ <AdjustmentsIcon fontSize={ SIZE } /> }
				/>
				<Divider />
				<TransformOriginControl rowRef={ rowRef } />
			</Popover>
		</>
	);
};
