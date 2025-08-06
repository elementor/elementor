import * as React from 'react';
import { useRef } from 'react';
import { transformOriginPropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, Divider, Grid, IconButton, Popover, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { ControlLabel } from '../../components/control-label';
import { SizeControl } from '../size-control';

const transformOriginUnits = [ 'px', '%', 'em', 'rem' ] as ( 'px' | '%' | 'em' | 'rem' )[];

const baseControlsFields = [
	{
		label: __( 'Origin X', 'elementor' ),
		bindValue: 'x',
		units: transformOriginUnits,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bindValue: 'y',
		units: transformOriginUnits,
	},
	{
		label: __( 'Origin Z', 'elementor' ),
		bindValue: 'z',
		units: transformOriginUnits.filter( ( unit ) => unit !== '%' ),
	},
];

export const TransformBaseControl = React.forwardRef< HTMLDivElement >( ( _, ref ) => {
	const buttonRef = useRef< HTMLButtonElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );
	const context = useBoundProp( transformOriginPropTypeUtil );

	const handleOpen = () => buttonRef.current && popupState.open( buttonRef.current );
	const handleClose = () => popupState.close();

	return (
		<>
			<IconButton ref={ buttonRef } onClick={ handleOpen } size="small">
				<AdjustmentsIcon fontSize="tiny" />
			</IconButton>

			<Popover
				{ ...bindPopover( popupState ) }
				onClose={ handleClose }
				disablePortal
				slotProps={ {
					paper: {
						sx: {
							/* … */
						},
					},
				} }
			>
				<PopoverHeader
					title={ __( 'Base Transform', 'elementor' ) }
					onClose={ handleClose }
					icon={ <AdjustmentsIcon fontSize="tiny" /> }
				/>

				<Divider />

				{ /* Provide transform-origin context directly */ }
				<PropProvider { ...context }>
					<PropKeyProvider bind="transform-origin">
						<Stack direction="column" spacing={ 1.5 }>
							<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>
								{ __( 'Transform', 'elementor' ) }
							</ControlFormLabel>

							<Grid container spacing={ 1.5 } ref={ ref as React.RefObject< HTMLDivElement > }>
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
														units={ control.units }
														disableCustom
													/>
												</PropKeyProvider>
											</Grid>
										</Grid>
									</Grid>
								) ) }

								<Divider sx={ { py: 3 } } />
							</Grid>
						</Stack>
					</PropKeyProvider>
				</PropProvider>
			</Popover>
		</>
	);
} );
