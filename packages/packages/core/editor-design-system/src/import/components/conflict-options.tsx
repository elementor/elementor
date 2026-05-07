import * as React from 'react';
import { Card, CardActionArea, Radio, RadioGroup, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ConflictStrategy } from '../types';

type Option = {
	value: ConflictStrategy;
	title: string;
	description: string;
};

const getOptions = (): Option[] => [
	{
		value: 'replace',
		title: __( 'Replace existing values', 'elementor' ),
		description: __( 'Imported design system values will overwrite existing variables and classes.', 'elementor' ),
	},
	{
		value: 'keep',
		title: __( 'Keep existing values', 'elementor' ),
		description: __( 'Existing variables and classes will not change.', 'elementor' ),
	},
];

type Props = {
	value: ConflictStrategy | null;
	onChange: ( value: ConflictStrategy ) => void;
};

export const ConflictOptions = ( { value, onChange }: Props ) => {
	const options = getOptions();

	return (
		<Stack spacing={ 1 }>
			<Typography variant="body1">
				{ __( 'How to handle conflicts with existing variables or classes?', 'elementor' ) }
			</Typography>
			<RadioGroup
				value={ value ?? '' }
				onChange={ ( _: unknown, next: string ) => onChange( next as ConflictStrategy ) }
			>
				<Stack spacing={ 1 }>
					{ options.map( ( option ) => (
						<Card key={ option.value } variant="outlined">
							<CardActionArea onClick={ () => onChange( option.value ) }>
								<Stack direction="row" alignItems="center" spacing={ 2 } padding={ 2 }>
									<Radio
										value={ option.value }
										checked={ value === option.value }
										inputProps={ { 'aria-label': option.title } }
									/>
									<Stack direction="column" spacing={ 0.5 }>
										<Typography variant="subtitle2">{ option.title }</Typography>
										<Typography variant="caption" color="text.secondary">
											{ option.description }
										</Typography>
									</Stack>
								</Stack>
							</CardActionArea>
						</Card>
					) ) }
				</Stack>
			</RadioGroup>
		</Stack>
	);
};
