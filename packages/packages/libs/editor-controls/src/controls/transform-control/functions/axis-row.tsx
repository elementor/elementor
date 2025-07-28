import { type RefObject } from 'react';
import * as React from 'react';
import { type AngleUnit } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { ControlLabel } from '../../../components/control-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { SizeControl } from '../../size-control';

type TransformAxisRowProps = {
	label: string;
	bindValue: 'x' | 'y' | 'z';
	startIcon: React.ReactNode;
	anchorRef?: RefObject< HTMLDivElement | null >;
	units?: AngleUnit[];
};

export const AxisRow = ( { label, bindValue, startIcon, anchorRef, units }: TransformAxisRowProps ) => {
	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer ref={ anchorRef }>
				<Grid item xs={ 6 }>
					<ControlLabel>{ label }</ControlLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<PropKeyProvider bind={ bindValue }>
						<SizeControl anchorRef={ anchorRef } startIcon={ startIcon } units={ units } variant="angle" />
					</PropKeyProvider>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
};
