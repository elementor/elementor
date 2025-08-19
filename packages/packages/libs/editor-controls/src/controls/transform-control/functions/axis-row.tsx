import { type RefObject } from 'react';
import * as React from 'react';
import { Grid } from '@elementor/ui';

import { PropKeyProvider } from '../../../bound-prop-context';
import { ControlLabel } from '../../../components/control-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { type AngleUnit, type LengthUnit } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

type TransformAxisRowProps = {
	label: string;
	bind: 'x' | 'y' | 'z';
	startIcon: React.ReactNode;
	anchorRef?: RefObject< HTMLDivElement | null >;
	units?: AngleUnit[] | LengthUnit[];
	variant?: 'length' | 'angle';
};

export const AxisRow = ( { label, bind, startIcon, anchorRef, units, variant = 'angle' }: TransformAxisRowProps ) => {
	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer ref={ anchorRef }>
				<Grid item xs={ 6 }>
					<ControlLabel>{ label }</ControlLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<PropKeyProvider bind={ bind }>
						<SizeControl
							anchorRef={ anchorRef }
							startIcon={ startIcon }
							units={ units }
							variant={ variant }
						/>
					</PropKeyProvider>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
};
