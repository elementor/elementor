import * as React from 'react';
import { transformOriginPropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, Divider, Popover, type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ChildrenPerspectiveControl } from './transform-base-controls/children-perspective-control';
import { TransformOriginControl } from './transform-base-controls/transform-origin-control';

const SIZE = 'tiny';

export const TransformBaseControl = ( {
	popupState,
	anchorRef,
}: {
	popupState: PopupState;
	anchorRef: React.RefObject< HTMLDivElement | null >;
} ) => {
	const popupProps = bindPopover( {
		...popupState,
		anchorEl: anchorRef.current ?? undefined,
	} );

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: {
						width: anchorRef.current?.offsetWidth + 'px',
						mt: anchorRef.current?.offsetHeight + 'px',
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
			<PropKeyProvider bind={ 'transform-origin' }>
				<TransformOriginContextProvider>
					<TransformOriginControl />
				</TransformOriginContextProvider>
			</PropKeyProvider>
			<Divider />
			<ChildrenPerspectiveControl />
		</Popover>
	);
};

const TransformOriginContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const context = useBoundProp( transformOriginPropTypeUtil );

	return <PropProvider { ...context }>{ children }</PropProvider>;
};
