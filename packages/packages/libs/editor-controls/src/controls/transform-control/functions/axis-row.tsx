import { type RefObject } from 'react';
import * as React from 'react';
import { type Unit } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { ControlLabel } from '../../../components/control-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { type DegreeUnit } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

type TransformAxisRowProps = {
	label: string;
	bindValue: 'x' | 'y' | 'z';
	startIcon: React.ReactNode;
	anchorRef?: RefObject< HTMLDivElement | null >;
	units?: ( Unit | DegreeUnit )[];
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
						<SizeControl anchorRef={ anchorRef } startIcon={ startIcon } units={ units } />
					</PropKeyProvider>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
};
