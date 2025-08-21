import * as React from 'react';
import { transformOriginPropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, Divider, Popover, type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { PopoverContent } from '../../components/popover-content';
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
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
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
			<PopoverContent sx={ { p: 1.5 } }>
				<PropKeyProvider bind={ 'transform-origin' }>
					<TransformOriginContextProvider>
						<TransformOriginControl />
					</TransformOriginContextProvider>
				</PropKeyProvider>
				<Divider />
				<ChildrenPerspectiveControl />
			</PopoverContent>
		</Popover>
	);
};

const TransformOriginContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const context = useBoundProp( transformOriginPropTypeUtil );

	return <PropProvider { ...context }>{ children }</PropProvider>;
};
