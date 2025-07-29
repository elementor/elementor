import * as React from 'react';
import { type RefObject, useRef } from 'react';

import { PopoverHeader } from '@elementor/editor-ui';
import { bindPopover, Divider, Grid, Popover, type PopupState, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';


import { ControlFormLabel } from '../../components/control-form-label';
import { type TransformOriginUnit, transformOriginUnits } from '../../utils/size-control';
import { SizeControl } from '../size-control';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLElement | null >;
};

const originControls = [
	{
		label: __( 'Origin X', 'elementor' ),
		bindValue: 'x' as const,
		units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		defaultUnit: '%' as TransformOriginUnit,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bindValue: 'y' as const,
		units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		defaultUnit: '%' as TransformOriginUnit,
	},
	{
		label: __( 'Origin Z', 'elementor' ),
		bindValue: 'z' as const,
		units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		defaultUnit: 'px' as TransformOriginUnit,
	},
];

export const TransformOriginControl = ( props: Props ) => {
	const { popupState, anchorRef } = props;
	const rowRef = useRef< HTMLDivElement >( null );

	const handleClose = () => {
		popupState.close();
	};

	return (
		<Popover
			disablePortal
			slotProps={ {
				paper: {
					sx: {
						p: 1.5,
						width: anchorRef.current?.offsetWidth + 'px',
					},
				},
			} }
			{ ...bindPopover( popupState ) }
			anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			transformOrigin={ { vertical: 'top', horizontal: 'center' } }
			onClose={ handleClose }
		>
			<PopoverHeader title={ __( 'Base Transform', 'elementor' ) } onClose={ handleClose } />

			<Divider />

			<Stack direction="column" spacing={ 1.5 }>
				<ControlFormLabel>{ __( 'Transform', 'elementor' ) }</ControlFormLabel>
				<Grid container spacing={ 1.5 } ref={ rowRef }>
					{ originControls.map( ( control ) => (
						<Grid item xs={ 12 } key={ control.bindValue }>
							<Grid container spacing={ 1 } alignItems="center">
								<Grid item xs={ 6 }>
									<ControlFormLabel>{ control.label }</ControlFormLabel>
								</Grid>
								<Grid item xs={ 6 } sx={ { pr: 1.5 } }>
									<SizeControl
										variant="length"
										units={ control.units }
										defaultUnit={ control.defaultUnit }
										anchorRef={ rowRef }
										disableCustom={ true }
									/>
								</Grid>
							</Grid>
						</Grid>
					) ) }
				</Grid>
			</Stack>
		</Popover>
	);
};
