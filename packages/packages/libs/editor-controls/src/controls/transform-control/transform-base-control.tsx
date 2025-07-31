import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { transformOriginPropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, Divider, Grid, Popover, type PopupState, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { ControlLabel } from '../../components/control-label';
// import { type TransformOriginUnit, transformOriginUnits } from '../../utils/size-control';
import { SizeControl } from '../size-control';

type Props = {
	popupState: PopupState;
	anchorRef: RefObject< HTMLElement | null >;
};

const baseControlsFields = [
	{
		label: __( 'Origin X', 'elementor' ),
		bindValue: 'x',
		// units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		// defaultUnit: 'px' as TransformOriginUnit,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bindValue: 'y',
		// units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		// defaultUnit: 'px' as TransformOriginUnit,
	},
	{
		label: __( 'Origin Z', 'elementor' ),
		bindValue: 'z',
		// units: [ ...transformOriginUnits ] as TransformOriginUnit[],
		// defaultUnit: 'px' as TransformOriginUnit,
	},
];

export const TransformBaseControl = ( props: Props ) => {
	const { popupState, anchorRef } = props;
	const context = useBoundProp( transformOriginPropTypeUtil );
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
						width: anchorRef.current?.offsetWidth + 'px',
					},
				},
			} }
			{ ...bindPopover( popupState ) }
			// anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
			// transformOrigin={ { vertical: 'top', horizontal: 'center' } }
			onClose={ handleClose }
		>
			<PopoverHeader
				title={ __( 'Base Transform', 'elementor' ) }
				onClose={ handleClose }
				icon={ <AdjustmentsIcon fontSize={ 'tiny' } /> }
			/>

			<Divider />

			<Stack direction="column" spacing={ 1.5 }>
				<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>{ __( 'Transform', 'elementor' ) }</ControlFormLabel>
				<PropProvider { ...context }>
					<PropKeyProvider bind={ 'transform-origin' }>
						<Grid container spacing={ 1.5 } ref={ rowRef }>
							{ baseControlsFields.map( ( control ) => (
								<Grid item xs={ 12 } key={ control.bindValue }>
									<Grid container spacing={ 1 } alignItems="center">
										<Grid item xs={ 6 }>
											<ControlLabel>{ control.label }</ControlLabel>
										</Grid>
										<Grid item xs={ 6 } sx={ { pr: 3 } }>
											<PropKeyProvider bind={ control.bindValue }>
												<SizeControl
													variant="length"
													// units={ control.units }
													anchorRef={ rowRef }
													disableCustom={ true }
												/>
											</PropKeyProvider>
										</Grid>
									</Grid>
								</Grid>
							) ) }
						</Grid>
					</PropKeyProvider>
				</PropProvider>
			</Stack>
		</Popover>
	);
};
