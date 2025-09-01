import { type RefObject } from 'react';
import * as React from 'react';
import { Grid } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { ControlLabel } from '../../../components/control-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { NumberControl } from '../../number-control';

type ScaleAxisRowProps = {
	label: string;
	bind: 'x' | 'y' | 'z';
	startIcon: React.ReactNode;
	anchorRef?: RefObject< HTMLDivElement | null >;
};

export const ScaleAxisRow = ( { label, bind, startIcon, anchorRef }: ScaleAxisRowProps ) => {
	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer ref={ anchorRef }>
				<Grid item xs={ 6 }>
					<ControlLabel>{ label }</ControlLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<PropKeyProvider bind={ bind }>
						<NumberControl step={ 0.1 } placeholder="1" startIcon={ startIcon } />
					</PropKeyProvider>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
};
