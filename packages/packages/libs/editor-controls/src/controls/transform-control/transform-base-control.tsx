import * as React from 'react';
import { useRef } from 'react';
import { PopoverHeader } from '@elementor/editor-ui';
import { AdjustmentsIcon, PlusIcon } from '@elementor/icons';
import { bindPopover, Button, Divider, Grid, IconButton, Popover, Stack, usePopupState } from '@elementor/ui';
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

export const TransformBaseControl = ( { ref }: { ref: React.Ref< HTMLDivElement > } ) => {
	const buttonRef = useRef< HTMLButtonElement >( null );

	const popupState = usePopupState( { variant: 'popover' } );
	console.log( ref );
	const handleOpenBaseTransform = () => {
		if ( buttonRef.current ) {
			popupState.open( buttonRef.current );
		}
	};

	const handleClose = () => {
		popupState.close();
	};

	return (
		<>
			<IconButton
				size={ 'tiny' }
				ref={ buttonRef }
				onClick={ handleOpenBaseTransform }
				aria-label={ __( 'Add item', 'elementor' ) }
			>
				<AdjustmentsIcon fontSize={ 'tiny' } />
			</IconButton>
			<Popover
				disablePortal
				slotProps={ {
					paper: {
						sx: {
							// width: anchorRef.current?.offsetWidth + 'px',
						},
					},
				} }
				{ ...bindPopover( popupState ) }
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
					<Grid container spacing={ 1.5 } ref={ ref }>
						{ baseControlsFields.map( ( control ) => (
							<Grid item xs={ 12 } key={ control.bindValue }>
								<Grid container spacing={ 1 } alignItems="center">
									<Grid item xs={ 6 }>
										<ControlLabel>{ control.label }</ControlLabel>
									</Grid>
									<Grid item xs={ 6 } sx={ { pr: 3 } }>
										{ /* <PropKeyProvider bind={ control.bindValue }> */ }
										<SizeControl
											variant="length"
											units={ control.units }
											// anchorRef={ ref }
											disableCustom={ true }
										/>
										{ /* </PropKeyProvider> */ }
									</Grid>
								</Grid>
							</Grid>
						) ) }
						<Divider sx={ { py: 3 } } />
					</Grid>
				</Stack>
			</Popover>
		</>
	);
};
