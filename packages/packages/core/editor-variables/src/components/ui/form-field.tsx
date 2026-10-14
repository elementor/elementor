import * as React from 'react';
import type { PropsWithChildren } from 'react';
import { FormHelperText, FormLabel, Grid } from '@elementor/ui';

type Props = PropsWithChildren< {
	id?: string;
	label: string;
	errorMsg?: string;
	noticeMsg?: string;
} >;

export const FormField = ( { id, label, errorMsg, noticeMsg, children }: Props ) => {
	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel htmlFor={ id } size="tiny">
					{ label }
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
