import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlFormLabel, PopoverGridContainer } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

export const Field = ( { label, children }: { label: string } & PropsWithChildren ) => {
	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ label }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
					{ children }
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
};
