import * as React from 'react';
import { useEffect, useState } from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { ArrowsMoveHorizontalIcon, ArrowsMoveVerticalIcon } from '@elementor/icons';
import { Grid, Select, type SelectChangeEvent, Stack, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { ControlLabel } from '../components/control-label';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const RATIO_OPTIONS = [
	{ label: __( 'Auto', 'elementor' ), value: 'auto' },
	{ label: '1/1', value: '1/1' },
	{ label: '4/3', value: '4/3' },
	{ label: '3/4', value: '3/4' },
	{ label: '16/9', value: '16/9' },
	{ label: '9/16', value: '9/16' },
	{ label: '3/2', value: '3/2' },
	{ label: '2/3', value: '2/3' },
];

const CUSTOM_RATIO = 'custom';

export const AspectRatioControl = createControl( ( { label }: { label: string } ) => {
	const { value: aspectRatioValue, setValue: setAspectRatioValue, disabled } = useBoundProp( stringPropTypeUtil );

	const isCustomSelected =
		aspectRatioValue && ! RATIO_OPTIONS.some( ( option ) => option.value === aspectRatioValue );
	const [ initialWidth, initialHeight ] = isCustomSelected ? aspectRatioValue.split( '/' ) : [ '', '' ];

	const [ isCustom, setIsCustom ] = useState( isCustomSelected );
	const [ customWidth, setCustomWidth ] = useState< string >( initialWidth );
	const [ customHeight, setCustomHeight ] = useState< string >( initialHeight );
	const [ selectedValue, setSelectedValue ] = useState< string >(
		isCustomSelected ? CUSTOM_RATIO : aspectRatioValue || ''
	);

	useEffect( () => {
		const isCustomValue =
			aspectRatioValue && ! RATIO_OPTIONS.some( ( option ) => option.value === aspectRatioValue );

		if ( isCustomValue ) {
			const [ width, height ] = aspectRatioValue.split( '/' );
			setCustomWidth( width || '' );
			setCustomHeight( height || '' );
			setSelectedValue( CUSTOM_RATIO );
			setIsCustom( true );
		} else {
			setSelectedValue( aspectRatioValue || '' );
			setIsCustom( false );
			setCustomWidth( '' );
			setCustomHeight( '' );
		}
	}, [ aspectRatioValue ] );

	const handleSelectChange = ( event: SelectChangeEvent< string > ) => {
		const newValue = event.target.value;
		const isCustomRatio = newValue === CUSTOM_RATIO;

		setIsCustom( isCustomRatio );
		setSelectedValue( newValue );

		if ( isCustomRatio ) {
			return;
		}

		setAspectRatioValue( newValue );
	};
	const handleCustomWidthChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newWidth = event.target.value;
		setCustomWidth( newWidth );

		if ( newWidth && customHeight ) {
			setAspectRatioValue( `${ newWidth }/${ customHeight }` );
		}
	};

	const handleCustomHeightChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newHeight = event.target.value;
		setCustomHeight( newHeight );

		if ( customWidth && newHeight ) {
			setAspectRatioValue( `${ customWidth }/${ newHeight }` );
		}
	};

	return (
		<ControlActions>
			<Stack direction="column" gap={ 2 }>
				<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
					<Grid item xs={ 6 }>
						<ControlLabel>{ label }</ControlLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<Select
							size="tiny"
							displayEmpty
							sx={ { overflow: 'hidden' } }
							disabled={ disabled }
							value={ selectedValue }
							onChange={ handleSelectChange }
							fullWidth
						>
							{ [ ...RATIO_OPTIONS, { label: __( 'Custom', 'elementor' ), value: CUSTOM_RATIO } ].map(
								( { label: optionLabel, ...props } ) => (
									<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
										{ optionLabel }
									</MenuListItem>
								)
							) }
						</Select>
					</Grid>
				</Grid>
				{ isCustom && (
					<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
						<Grid item xs={ 6 }>
							<TextField
								size="tiny"
								type="number"
								fullWidth
								disabled={ disabled }
								value={ customWidth }
								onChange={ handleCustomWidthChange }
								InputProps={ {
									startAdornment: <ArrowsMoveHorizontalIcon fontSize="tiny" />,
								} }
							/>
						</Grid>
						<Grid item xs={ 6 }>
							<TextField
								size="tiny"
								type="number"
								fullWidth
								disabled={ disabled }
								value={ customHeight }
								onChange={ handleCustomHeightChange }
								InputProps={ {
									startAdornment: <ArrowsMoveVerticalIcon fontSize="tiny" />,
								} }
							/>
						</Grid>
					</Grid>
				) }
			</Stack>
		</ControlActions>
	);
} );
