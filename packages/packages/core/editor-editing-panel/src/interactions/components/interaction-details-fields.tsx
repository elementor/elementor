import * as React from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { ArrowDownSmallIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpSmallIcon } from '@elementor/icons';
import { Grid, Select, type SelectChangeEvent, ToggleButton, ToggleButtonGroup, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type FieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

export function Trigger( { value, onChange }: FieldProps ) {
	const availableTriggers = Object.entries( {
		'page-load': __( 'Page load', 'elementor' ),
		'scroll-in-view': __( 'Scroll into view', 'elementor' ),
		'scroll-out-of-view': __( 'Scroll out of view', 'elementor' ),
	} ).map( ( [ key, label ] ) => ( {
		key,
		label,
	} ) );

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Trigger', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
					value={ value }
				>
					{ availableTriggers.map( ( trigger ) => {
						return (
							<MenuListItem key={ trigger.key } value={ trigger.key }>
								{ trigger.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}

export function Effect( { value, onChange }: FieldProps ) {
	const availableEffects = [
		{ key: 'fade', label: __( 'Fade', 'elementor' ) },
		{ key: 'slide', label: __( 'Slide', 'elementor' ) },
		{ key: 'scale', label: __( 'Scale', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Effect', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					value={ value }
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
				>
					{ availableEffects.map( ( effect ) => {
						return (
							<MenuListItem key={ effect.key } value={ effect.key }>
								{ effect.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}

export function EffectType( { value, onChange }: FieldProps ) {
	const availableEffectTypes = [
		{ key: 'in', label: __( 'In', 'elementor' ) },
		{ key: 'out', label: __( 'Out', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Type', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<ToggleButtonGroup
					size="tiny"
					exclusive
					onChange={ ( event: React.MouseEvent< HTMLElement >, newValue: string ) => onChange( newValue ) }
					value={ value }
				>
					{ availableEffectTypes.map( ( effectType ) => {
						return (
							<ToggleButton key={ effectType.key } value={ effectType.key }>
								{ effectType.label }
							</ToggleButton>
						);
					} ) }
				</ToggleButtonGroup>
			</Grid>
		</>
	);
}

export function Direction( { value, onChange }: FieldProps ) {
	const availableDirections = [
		{ key: 'up', label: __( 'Up', 'elementor' ), icon: <ArrowUpSmallIcon fontSize="tiny" /> },
		{ key: 'down', label: __( 'Down', 'elementor' ), icon: <ArrowDownSmallIcon fontSize="tiny" /> },
		{ key: 'left', label: __( 'Left', 'elementor' ), icon: <ArrowLeftIcon fontSize="tiny" /> },
		{ key: 'right', label: __( 'Right', 'elementor' ), icon: <ArrowRightIcon fontSize="tiny" /> },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Direction', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<ToggleButtonGroup
					size="tiny"
					exclusive
					onChange={ ( event: React.MouseEvent< HTMLElement >, newValue: string ) => onChange( newValue ) }
					value={ value }
				>
					{ availableDirections.map( ( direction ) => {
						return (
							<ToggleButton key={ direction.key } value={ direction.key }>
								{ direction.icon }
							</ToggleButton>
						);
					} ) }
				</ToggleButtonGroup>
			</Grid>
		</>
	);
}

export function Duration( { value, onChange }: FieldProps ) {
	const availableDurations = [
		{ key: '100', label: __( '100 MS', 'elementor' ) },
		{ key: '200', label: __( '200 MS', 'elementor' ) },
		{ key: '300', label: __( '300 MS', 'elementor' ) },
		{ key: '400', label: __( '400 MS', 'elementor' ) },
		{ key: '500', label: __( '500 MS', 'elementor' ) },
		{ key: '750', label: __( '750 MS', 'elementor' ) },
		{ key: '1000', label: __( '1000 MS', 'elementor' ) },
		{ key: '1250', label: __( '1250 MS', 'elementor' ) },
		{ key: '1500', label: __( '1500 MS', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Duration', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					value={ value }
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
				>
					{ availableDurations.map( ( duration ) => {
						return (
							<MenuListItem key={ duration.key } value={ duration.key }>
								{ duration.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}

export function Delay( { value, onChange }: FieldProps ) {
	const availableDelays = [
		{ key: '0', label: __( '0 MS', 'elementor' ) },
		{ key: '100', label: __( '100 MS', 'elementor' ) },
		{ key: '200', label: __( '200 MS', 'elementor' ) },
		{ key: '300', label: __( '300 MS', 'elementor' ) },
		{ key: '400', label: __( '400 MS', 'elementor' ) },
		{ key: '500', label: __( '500 MS', 'elementor' ) },
	];

	return (
		<>
			<Grid item xs={ 12 } md={ 6 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Delay', 'elementor' ) }
				</Typography>
			</Grid>
			<Grid item xs={ 12 } md={ 6 }>
				<Select
					fullWidth
					displayEmpty
					size="tiny"
					value={ value }
					onChange={ ( event: SelectChangeEvent< string > ) => onChange( event.target.value ) }
				>
					{ availableDelays.map( ( delay ) => {
						return (
							<MenuListItem key={ delay.key } value={ delay.key }>
								{ delay.label }
							</MenuListItem>
						);
					} ) }
				</Select>
			</Grid>
		</>
	);
}
