import * as React from 'react';
import { useState } from 'react';
import { Form, MenuListItem } from '@elementor/editor-ui';
import { Button, FormLabel, Grid, Select, Stack, type SxProps, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridableProp } from '../../types';

const SIZE = 'tiny';

const DEFAULT_GROUP = { value: null, label: __( 'Default', 'elementor' ) };

type Props = {
	onSubmit: ( data: { label: string; group: string | null } ) => void;
	currentValue?: OverridableProp;
	groups?: { value: string; label: string }[];
	sx?: SxProps;
};

export function OverridablePropForm( { onSubmit, groups, currentValue, sx }: Props ) {
	const [ propLabel, setPropLabel ] = useState< string | null >( currentValue?.label ?? null );
	const [ group, setGroup ] = useState< string | null >( currentValue?.groupId ?? groups?.[ 0 ]?.value ?? null );

	const name = __( 'Name', 'elementor' );
	const groupName = __( 'Group Name', 'elementor' );

	const isCreate = currentValue === undefined;

	const title = isCreate ? __( 'Create new property', 'elementor' ) : __( 'Update property', 'elementor' );
	const ctaLabel = isCreate ? __( 'Create', 'elementor' ) : __( 'Update', 'elementor' );

	return (
		<Form onSubmit={ () => propLabel && onSubmit( { label: propLabel, group } ) }>
			<Stack alignItems="start" sx={ { width: '268px', ...( sx as object ) } }>
				<Stack
					direction="row"
					alignItems="center"
					py={ 1 }
					px={ 1.5 }
					sx={ { columnGap: 0.5, borderBottom: '1px solid', borderColor: 'divider', width: '100%', mb: 1.5 } }
				>
					<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: '500', lineHeight: 1 } }>
						{ title }
					</Typography>
				</Stack>
				<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ name }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<TextField
							name={ name }
							size={ SIZE }
							fullWidth
							placeholder={ __( 'Enter value', 'elementor' ) }
							value={ propLabel ?? '' }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => setPropLabel( e.target.value ) }
						/>
					</Grid>
				</Grid>
				<Grid container gap={ 0.75 } alignItems="start" px={ 1.5 } mb={ 1.5 }>
					<Grid item xs={ 12 }>
						<FormLabel size="tiny">{ groupName }</FormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<Select
							name={ groupName }
							size={ SIZE }
							fullWidth
							value={ group ?? null }
							onChange={ ( e: React.ChangeEvent< HTMLSelectElement > ) =>
								setGroup( e.target.value as string | null )
							}
							displayEmpty
							renderValue={ ( selectedValue: string | null ) => {
								if ( ! selectedValue || selectedValue === '' ) {
									const [ firstGroup = DEFAULT_GROUP ] = groups ?? [];

									return firstGroup.label;
								}

								return groups?.find( ( { value } ) => value === selectedValue )?.label ?? selectedValue;
							} }
						>
							{ ( groups ?? [ DEFAULT_GROUP ] ).map( ( { label: groupLabel, ...props } ) => (
								<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
									{ groupLabel }
								</MenuListItem>
							) ) }
						</Select>
					</Grid>
				</Grid>
				<Stack direction="row" justifyContent="flex-end" alignSelf="end" mt={ 1.5 } py={ 1 } px={ 1.5 }>
					<Button type="submit" disabled={ ! propLabel } variant="contained" color="primary" size="small">
						{ ctaLabel }
					</Button>
				</Stack>
			</Stack>
		</Form>
	);
}
