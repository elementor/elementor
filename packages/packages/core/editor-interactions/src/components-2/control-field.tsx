import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ControlFormLabel, PopoverGridContainer } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

type Props = PropsWithChildren & {
	label: string;
};

export const ControlField = ( { label, children }: Props ) => {
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
