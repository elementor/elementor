import * as React from 'react';
import { useState } from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { ClearIcon, FilterIcon } from '@elementor/icons';
import {
	bindPopover,
	bindToggle,
	Checkbox,
	Chip,
	IconButton,
	MenuItem,
	MenuList,
	Popover,
	Stack,
	ToggleButton,
	Typography,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilterAndSortContext } from './context';

type CheckBoxItem = {
	label: string;
	value: string;
};

export const checkBoxItems: CheckBoxItem[] = [
	{
		label: __( 'Unused', 'elementor' ),
		value: 'unused',
	},
	{
		label: __( 'Empty', 'elementor' ),
		value: 'empty',
	},
	{
		label: __( 'On this page', 'elementor' ),
		value: 'page',
	},
];

export const CssClassFilter = () => {
	const { checked, setChecked } = useFilterAndSortContext();
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const handleClearFilters = ( e ) => {
		e.preventDefault();
		setChecked( {} );
	};

	const handleCheckBoxChange = ( value: string ) => {
		setChecked( ( prev ) => ( { ...prev, [ value ]: ! prev[ value ] } ) );
	};

	return (
		<>
			<ToggleButton size="small" aria-label={ __( 'Filters', 'elementor' ) } { ...bindToggle( popupState ) }>
				<FilterIcon fontSize="inherit" />
			</ToggleButton>
			<Popover
				sx={ {
					maxWidth: '344px',
				} }
				anchorOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: -21,
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					actions={ [
						<IconButton
							key={ 'clear-filters' }
							size="tiny"
							onClick={ handleClearFilters }
							aria-label={ __( 'Clear filters', 'elementor' ) }
						>
							<ClearIcon fontSize="tiny" />
						</IconButton>,
					] }
					onClose={ popupState.close }
					title={ __( 'Filters', 'elementor' ) }
					icon={ <FilterIcon /> }
				/>
				<PopoverBody width={ 344 } height={ 'auto' }>
					<MenuList>
						{ checkBoxItems.map( ( { label, value }: CheckBoxItem ) => (
							<LabeledCheckbox
								suffix={ <Chip sx={ { ml: 'auto' } } title={ 10 } /> }
								key={ label }
								label={ label }
								onCheck={ () => handleCheckBoxChange( value ) }
								checked={ checked?.[ value ] || false }
							/>
						) ) }
					</MenuList>
				</PopoverBody>
			</Popover>
		</>
	);
};

type LabeledCheckboxProps = {
	label: string;
	suffix?: React.ReactNode;
	onCheck: ( value: boolean ) => void;
	checked?: boolean;
};

const LabeledCheckbox = ( { label, suffix, onCheck, checked }: LabeledCheckboxProps ) => (
	<MenuItem onClick={ onCheck }>
		<Stack direction="row" alignItems="center" gap={ 0.5 } flex={ 1 }>
			<Checkbox
				checked={ checked }
				sx={ {
					padding: 0,
					color: 'text.tertiary',
					'&:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked:hover': {
						backgroundColor: 'transparent',
					},
					'&.Mui-checked': {
						color: 'text.tertiary',
					},
				} }
			/>
			<Typography variant="caption" sx={ { color: 'text.secondary' } }>
				{ label }
			</Typography>
			{ suffix }
		</Stack>
	</MenuItem>
);
