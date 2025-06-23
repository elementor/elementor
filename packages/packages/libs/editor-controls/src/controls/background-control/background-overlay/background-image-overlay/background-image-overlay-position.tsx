import * as React from 'react';
import { useRef } from 'react';
import { backgroundImagePositionOffsetPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { LetterXIcon, LetterYIcon } from '@elementor/icons';
import { Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../../bound-prop-context';
import { ControlFormLabel } from '../../../../components/control-form-label';
import { PopoverGridContainer } from '../../../../components/popover-grid-container';
import { SizeControl } from '../../../size-control';

type Positions =
	| 'center center'
	| 'center left'
	| 'center right'
	| 'top center'
	| 'top left'
	| 'top right'
	| 'bottom center'
	| 'bottom left'
	| 'bottom right'
	| 'custom';

const backgroundPositionOptions = [
	{ label: __( 'Center center', 'elementor' ), value: 'center center' },
	{ label: __( 'Center left', 'elementor' ), value: 'center left' },
	{ label: __( 'Center right', 'elementor' ), value: 'center right' },
	{ label: __( 'Top center', 'elementor' ), value: 'top center' },
	{ label: __( 'Top left', 'elementor' ), value: 'top left' },
	{ label: __( 'Top right', 'elementor' ), value: 'top right' },
	{ label: __( 'Bottom center', 'elementor' ), value: 'bottom center' },
	{ label: __( 'Bottom left', 'elementor' ), value: 'bottom left' },
	{ label: __( 'Bottom right', 'elementor' ), value: 'bottom right' },
	{ label: __( 'Custom', 'elementor' ), value: 'custom' },
];

export const BackgroundImageOverlayPosition = () => {
	const backgroundImageOffsetContext = useBoundProp( backgroundImagePositionOffsetPropTypeUtil );
	const stringPropContext = useBoundProp( stringPropTypeUtil );

	const isCustom = !! backgroundImageOffsetContext.value;
	const rowRef = useRef< HTMLDivElement >( null );

	const handlePositionChange = ( event: SelectChangeEvent< Positions > ) => {
		const value = event.target.value || null;

		if ( value === 'custom' ) {
			backgroundImageOffsetContext.setValue( { x: null, y: null } );
		} else {
			stringPropContext.setValue( value );
		}
	};

	return (
		<Grid container spacing={ 1.5 }>
			<Grid item xs={ 12 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Position', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' } }>
						<Select
							fullWidth
							size="tiny"
							onChange={ handlePositionChange }
							disabled={ stringPropContext.disabled }
							value={ ( backgroundImageOffsetContext.value ? 'custom' : stringPropContext.value ) ?? '' }
						>
							{ backgroundPositionOptions.map( ( { label, value } ) => (
								<MenuListItem key={ value } value={ value ?? '' }>
									{ label }
								</MenuListItem>
							) ) }
						</Select>
					</Grid>
				</PopoverGridContainer>
			</Grid>
			{ isCustom ? (
				<PropProvider { ...backgroundImageOffsetContext }>
					<Grid item xs={ 12 }>
						<Grid container spacing={ 1.5 } ref={ rowRef }>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'x' }>
									<SizeControl
										startIcon={ <LetterXIcon fontSize={ 'tiny' } /> }
										anchorRef={ rowRef }
									/>
								</PropKeyProvider>
							</Grid>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'y' }>
									<SizeControl
										startIcon={ <LetterYIcon fontSize={ 'tiny' } /> }
										anchorRef={ rowRef }
									/>
								</PropKeyProvider>
							</Grid>
						</Grid>
					</Grid>
				</PropProvider>
			) : null }
		</Grid>
	);
};
