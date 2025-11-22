import * as React from 'react';
import { useState } from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { Button, FormLabel, Grid, Select, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridableProp } from '../../types';

const SIZE = 'tiny';

const DEFAULT_GROUP = { value: null, label: __( 'Default', 'elementor' ) };

type Props = {
	onSubmit: ( data: { label: string; group: string | null } ) => void;
	currentValue?: OverridableProp;
	groups?: { value: string; label: string }[];
};

export function OverridablePropForm( { onSubmit, groups, currentValue }: Props ) {
	const [ label, setLabel ] = useState< string | null >( currentValue?.label ?? null );
	const [ group, setGroup ] = useState< string | null >( currentValue?.groupId ?? null );

	const handleCreate = () => {
		onSubmit( { label: label ?? '', group } );
	};

	return (
		<Stack alignItems="start" width="268px">
			<Stack
				direction="row"
				alignItems="center"
				py={ 1 }
				px={ 1.5 }
				sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%', mb: 1.5 } }
			>
				<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: '500', lineHeight: 1 } }>
					{ __( 'Create new property', 'elementor' ) }
				</Typography>
			</Stack>
			<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
				<Grid item xs={ 12 }>
					<FormLabel htmlFor="override-label" size="tiny">
						{ __( 'Name', 'elementor' ) }
					</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						id="override-label"
						size={ SIZE }
						fullWidth
						placeholder={ __( 'Enter value', 'elementor' ) }
						inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
						value={ label }
						onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setLabel( e.target.value ) }
					/>
				</Grid>
			</Grid>
			<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
				<Grid item xs={ 12 }>
					<FormLabel htmlFor="override-props-group" size="tiny">
						{ __( 'Group Name', 'elementor' ) }
					</FormLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<Select
						id="override-props-group"
						size={ SIZE }
						fullWidth
						inputProps={ { style: { color: 'text.primary', fontWeight: '600' } } }
						value={ group }
						onChange={ setGroup }
						isNullSelectable={ true }
						displayEmpty
						renderValue={ ( selectedValue: string | null ) => {
							if ( ! selectedValue || selectedValue === '' ) {
								return DEFAULT_GROUP.label;
							}
							return groups?.find( ( group ) => group.value === selectedValue )?.label ?? selectedValue;
						} }
					>
						{ ( groups ?? [ DEFAULT_GROUP ] ).map( ( { label, ...props } ) => (
							<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
								{ label }
							</MenuListItem>
						) ) }
					</Select>
				</Grid>
			</Grid>
			<Stack direction="row" justifyContent="flex-end" alignSelf="end" mt={ 1.5 } py={ 1 } px={ 1.5 }>
				<Button disabled={ ! label } onClick={ handleCreate } variant="contained" color="primary" size="small">
					{ __( 'Create', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
}
