import * as React from 'react';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, Box, Divider, Popover, type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider } from '../../bound-prop-context';
import { PopoverContent } from '../../components/popover-content';
import { ChildrenPerspectiveControl } from './transform-base-controls/children-perspective-control';
import { TransformOriginControl } from './transform-base-controls/transform-origin-control';

const SIZE = 'tiny';

export const TransformSettingsControl = ( {
	popupState,
	anchorRef,
	showChildrenPerspective,
}: {
	popupState: PopupState;
	anchorRef: React.RefObject< HTMLDivElement | null >;
	showChildrenPerspective: boolean;
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
						width: ( anchorRef.current?.offsetWidth || 0 ) - 6 + 'px',
						mt: 0.5,
					},
				},
			} }
			{ ...popupProps }
		>
			<PopoverHeader
				title={ __( 'Transform settings', 'elementor' ) }
				onClose={ popupState.close }
				icon={ <AdjustmentsIcon fontSize={ SIZE } /> }
			/>
			<Divider />
			<PopoverContent sx={ { px: 2, py: 1.5 } }>
				<PropKeyProvider bind={ 'transform-origin' }>
					<TransformOriginControl />
				</PropKeyProvider>
				{ showChildrenPerspective && (
					<>
						<Box sx={ { my: 0.5 } }>
							<Divider />
						</Box>
						<ChildrenPerspectiveControl />
					</>
				) }
			</PopoverContent>
		</Popover>
	);
};
