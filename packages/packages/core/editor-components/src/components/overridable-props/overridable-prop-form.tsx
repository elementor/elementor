import * as React from 'react';
import { useState } from 'react';
import { Form, MenuListItem } from '@elementor/editor-ui';
import { Button, FormLabel, Grid, Select, Stack, type SxProps, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type OverridableProp } from '../../types';
import { validatePropLabel } from './utils/validate-prop-label';

const SIZE = 'tiny';

const DEFAULT_GROUP = { value: null, label: __( 'Default', 'elementor' ) };

type Props = {
	onSubmit: ( data: { label: string; group: string | null } ) => void;
	currentValue?: OverridableProp;
	groups?: { value: string; label: string }[];
	existingLabels?: string[];
	sx?: SxProps;
};

export function OverridablePropForm( { onSubmit, groups, currentValue, existingLabels = [], sx }: Props ) {
	const selectGroups = groups?.length ? groups : [ DEFAULT_GROUP ];

	const [ propLabel, setPropLabel ] = useState< string | null >( currentValue?.label ?? null );
	const [ group, setGroup ] = useState< string | null >( currentValue?.groupId ?? selectGroups[ 0 ]?.value ?? null );
	const [ error, setError ] = useState< string | null >( null );

	const name = __( 'Name', 'elementor' );
	const groupName = __( 'Group Name', 'elementor' );

	const isCreate = currentValue === undefined;

	const title = isCreate ? __( 'Create new property', 'elementor' ) : __( 'Update property', 'elementor' );
	const ctaLabel = isCreate ? __( 'Create', 'elementor' ) : __( 'Update', 'elementor' );

	const handleSubmit = () => {
		const validationResult = validatePropLabel( propLabel ?? '', existingLabels, currentValue?.label );

		if ( ! validationResult.isValid ) {
			setError( validationResult.errorMessage );
			return;
		}

		onSubmit( { label: propLabel ?? '', group } );
	};

	return (
		<Form onSubmit={ handleSubmit }>
			<Stack alignItems="start" sx={ { width: '268px', ...sx } }>
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
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => {
								const newValue = e.target.value;
								setPropLabel( newValue );
								const validationResult = validatePropLabel(
									newValue,
									existingLabels,
									currentValue?.label
								);
								setError( validationResult.errorMessage );
							} }
							error={ Boolean( error ) }
							helperText={ error }
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
								if ( ! selectedValue ) {
									return selectGroups[ 0 ].label;
								}

								return (
									selectGroups.find( ( { value } ) => value === selectedValue )?.label ??
									selectedValue
								);
							} }
						>
							{ selectGroups.map( ( { label: groupLabel, ...props } ) => (
								<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
									{ groupLabel }
								</MenuListItem>
							) ) }
						</Select>
					</Grid>
				</Grid>
				<Stack direction="row" justifyContent="flex-end" alignSelf="end" mt={ 1.5 } py={ 1 } px={ 1.5 }>
					<Button
						type="submit"
						disabled={ ! propLabel || Boolean( error ) }
						variant="contained"
						color="primary"
						size="small"
					>
						{ ctaLabel }
					</Button>
				</Stack>
			</Stack>
		</Form>
	);
}
