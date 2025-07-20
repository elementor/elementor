import * as React from 'react';
import { positionPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { LetterXIcon, LetterYIcon } from '@elementor/icons';
import { Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { SizeControl } from './size-control';

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

const positionOptions = [
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

export const PositionControl = () => {
	const positionContext = useBoundProp( positionPropTypeUtil );
	const stringPropContext = useBoundProp( stringPropTypeUtil );

	const isCustom = !! positionContext.value;

	const handlePositionChange = ( event: SelectChangeEvent< Positions > ) => {
		const value = event.target.value || null;

		if ( value === 'custom' ) {
			positionContext.setValue( { x: null, y: null } );
		} else {
			stringPropContext.setValue( value );
		}
	};

	return (
		<Grid container spacing={ 1.5 }>
			<Grid item xs={ 12 }>
				<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Object position', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 } sx={ { overflow: 'hidden' } }>
						<Select
							size="tiny"
							disabled={ stringPropContext.disabled }
							value={ ( positionContext.value ? 'custom' : stringPropContext.value ) ?? '' }
							onChange={ handlePositionChange }
							fullWidth
						>
							{ positionOptions.map( ( { label, value } ) => (
								<MenuListItem key={ value } value={ value ?? '' }>
									{ label }
								</MenuListItem>
							) ) }
						</Select>
					</Grid>
				</Grid>
			</Grid>
			{ isCustom && (
				<PropProvider { ...positionContext }>
					<Grid item xs={ 12 }>
						<Grid container spacing={ 1.5 }>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'x' }>
									<SizeControl startIcon={ <LetterXIcon fontSize={ 'tiny' } /> } />
								</PropKeyProvider>
							</Grid>
							<Grid item xs={ 6 }>
								<PropKeyProvider bind={ 'y' }>
									<SizeControl startIcon={ <LetterYIcon fontSize={ 'tiny' } /> } />
								</PropKeyProvider>
							</Grid>
						</Grid>
					</Grid>
				</PropProvider>
			) }
		</Grid>
	);
};
