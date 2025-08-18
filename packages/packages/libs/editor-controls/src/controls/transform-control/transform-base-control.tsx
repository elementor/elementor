import * as React from 'react';
import {
	type TransformablePropType,
	type PerspectiveOriginPropValue,
	type TransformOriginPropValue,
} from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Divider, IconButton, Popover, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type PropContext, PropKeyProvider, PropProvider, UseBoundProp } from "../../bound-prop-context";
import { ChildrenPerspectiveControl } from './transform-base-controls/children-perspective-control';
import { TransformOriginControl } from './transform-base-controls/transform-origin-control';

const SIZE = 'tiny';

export const TransformBaseControl = ( {
	anchorRef,
	transformOriginContext,
	// perspectiveOriginContext,
}: {
	anchorRef: React.RefObject< HTMLDivElement | null >;
	transformOriginContext: UseBoundProp< TransformOriginPropValue >;
	// perspectiveOriginContext: UseBoundProp< PerspectiveOriginPropValue >;
} ) => {
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
				{/*<PropProvider { ...transformOriginContext }>*/}
				{/*	<PropKeyProvider bind={ 'transform-origin' }>*/}
						{/*<TransformOriginControl/>*/}
						<TransformOriginControl transformOriginContext={ transformOriginContext }/>
					{/*</PropKeyProvider>*/}
				{/*</PropProvider>*/}
				<Divider />
				{/*<PropProvider { ...perspectiveOriginContext }>*/}
				{/*	<PropKeyProvider bind={ 'transform-children' }>*/}
				{/*		<ChildrenPerspectiveControl />*/}
				{/*	</PropKeyProvider>*/}
				{/*</PropProvider>*/}
			</Popover>
		</>
	);
};
