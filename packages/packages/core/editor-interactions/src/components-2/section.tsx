import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { Grid } from '@elementor/ui';

export const Section = ( { children }: PropsWithChildren & { id: string } ) => {
	return (
		<Grid container spacing={ 1.5 }>
			{ children }
		</Grid>
	);
};
