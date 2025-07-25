import * as React from 'react';
import { useRef } from 'react';
import { backgroundImageSizeScalePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import {
	ArrowBarBothIcon,
	ArrowsMaximizeIcon,
	ArrowsMoveHorizontalIcon,
	ArrowsMoveVerticalIcon,
	LetterAIcon,
	PencilIcon,
} from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../../bound-prop-context';
import { ControlFormLabel } from '../../../../components/control-form-label';
import {
	ControlToggleButtonGroup,
	type ToggleButtonGroupItem,
} from '../../../../components/control-toggle-button-group';
import { PopoverGridContainer } from '../../../../components/popover-grid-container';
import { SizeControl } from '../../../size-control';

type Sizes = 'auto' | 'cover' | 'contain' | 'custom';

const sizeControlOptions: ToggleButtonGroupItem< Sizes >[] = [
	{
		value: 'auto',
		label: __( 'Auto', 'elementor' ),
		renderContent: ( { size } ) => <LetterAIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'cover',
		label: __( 'Cover', 'elementor' ),
		renderContent: ( { size } ) => <ArrowsMaximizeIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'contain',
		label: __( 'Contain', 'elementor' ),
		renderContent: ( { size } ) => <ArrowBarBothIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'custom',
		label: __( 'Custom', 'elementor' ),
		renderContent: ( { size } ) => <PencilIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const BackgroundImageOverlaySize = () => {
	const backgroundImageScaleContext = useBoundProp( backgroundImageSizeScalePropTypeUtil );
	const stringPropContext = useBoundProp( stringPropTypeUtil );

	const isCustom = !! backgroundImageScaleContext.value;
	const rowRef = useRef< HTMLDivElement >( null );

	const handleSizeChange = ( size: Sizes | null ) => {
		if ( size === 'custom' ) {
			backgroundImageScaleContext.setValue( { width: null, height: null } );
		} else {
			stringPropContext.setValue( size );
		}
	};

	return (
		<Grid container spacing={ 1.5 }>
			<Grid item xs={ 12 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Size', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 } sx={ { display: 'flex', justifyContent: 'flex-end' } }>
						<ControlToggleButtonGroup
							exclusive
							items={ sizeControlOptions }
							onChange={ handleSizeChange }
							disabled={ stringPropContext.disabled }
							value={
								( backgroundImageScaleContext.value ? 'custom' : stringPropContext.value ) as Sizes
							}
						/>
					</Grid>
				</PopoverGridContainer>
			</Grid>
			{ isCustom ? (
				<PropProvider { ...backgroundImageScaleContext }>
					<Grid item xs={ 12 } ref={ rowRef }>
						<PopoverGridContainer>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'width' }>
									<SizeControl
										startIcon={ <ArrowsMoveHorizontalIcon fontSize={ 'tiny' } /> }
										extendedOptions={ [ 'auto' ] }
										anchorRef={ rowRef }
									/>
								</PropKeyProvider>
							</Grid>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'height' }>
									<SizeControl
										startIcon={ <ArrowsMoveVerticalIcon fontSize={ 'tiny' } /> }
										extendedOptions={ [ 'auto' ] }
										anchorRef={ rowRef }
									/>
								</PropKeyProvider>
							</Grid>
						</PopoverGridContainer>
					</Grid>
				</PropProvider>
			) : null }
		</Grid>
	);
};
