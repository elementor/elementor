import * as React from 'react';
import { useRef } from 'react';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Divider, Grid, IconButton, Popover, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { ControlLabel } from '../../components/control-label';
import { SizeControl } from '../size-control';

const SIZE = 'tiny';

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

export const TransformOriginControl = ( { anchorRef }: { anchorRef: React.RefObject< HTMLDivElement | null > } ) => {
	const rowRef = useRef< HTMLDivElement >( null );
	const popupState = usePopupState( { variant: 'popover' } );
	const popupProps = bindPopover( {
		...popupState,
		anchorEl: anchorRef.current ?? undefined,
	} );

	const transformOriginContext = useBoundProp();

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

				<Stack direction="column" spacing={ 1.5 }>
					<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>{ __( 'Transform', 'elementor' ) }</ControlFormLabel>
					<Grid container spacing={ 1.5 } ref={ rowRef }>
						<PropProvider { ...transformOriginContext }>
							{ baseControlsFields.map( ( control ) => (
								<PropKeyProvider bind={ control.bindValue } key={ control.bindValue }>
									<Grid item xs={ 12 }>
										<Grid container spacing={ 1 } alignItems="center">
											<Grid item xs={ 6 }>
												<ControlLabel>{ control.label }</ControlLabel>
											</Grid>
											<Grid item xs={ 6 } sx={ { pr: 3 } }>
												<SizeControl
													variant="length"
													units={ control.units }
													anchorRef={ rowRef }
													disableCustom
												/>
											</Grid>
										</Grid>
									</Grid>
								</PropKeyProvider>
							) ) }
						</PropProvider>
						<Divider sx={ { py: 3 } } />
					</Grid>
				</Stack>
			</Popover>
		</>
	);
};
