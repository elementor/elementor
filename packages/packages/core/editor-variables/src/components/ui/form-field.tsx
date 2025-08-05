import * as React from 'react';
import type { PropsWithChildren } from 'react';
import { FormHelperText, FormLabel, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = PropsWithChildren< {
	id?: string;
	label: string;
	errorMsg?: string;
	noticeMsg?: string;
} >;

export const FormField = ( { id, errorMsg, noticeMsg, children }: Props ) => {
	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel htmlFor={ id } size="tiny">
					{ __( 'Name', 'elementor' ) }
				</FormLabel>
			</Grid>

			<Grid item xs={ 12 }>
				{ children }
				{ errorMsg && <FormHelperText error>{ errorMsg }</FormHelperText> }
				{ noticeMsg && <FormHelperText>{ noticeMsg }</FormHelperText> }
			</Grid>
		</Grid>
	);
};
