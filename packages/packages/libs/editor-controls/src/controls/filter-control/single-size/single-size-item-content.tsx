import { useRef } from 'react';
import * as React from 'react';
import {
	blurFilterPropTypeUtil,
	colorToneFilterPropTypeUtil,
	type createPropUtils,
	hueRotateFilterPropTypeUtil,
	intensityFilterPropTypeUtil,
} from '@elementor/editor-props';
import { Grid } from '@elementor/ui';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { SizeControl } from '../../size-control';
import { type FilterFunction } from '../configs';
import { useFilterConfig } from '../context/filter-config-context';

export const propTypeMap: Record< string, ReturnType< typeof createPropUtils > > = {
	blur: blurFilterPropTypeUtil,
	intensity: intensityFilterPropTypeUtil,
	'hue-rotate': hueRotateFilterPropTypeUtil,
	'color-tone': colorToneFilterPropTypeUtil,
};

export const SingleSizeItemContent = ( { filterFunc }: { filterFunc: FilterFunction } ) => {
	const rowRef = useRef< HTMLDivElement >( null );
	const { getFilterFunctionConfig } = useFilterConfig();
	const { valueName, filterFunctionGroup } = getFilterFunctionConfig( filterFunc );
	const context = useBoundProp( propTypeMap[ filterFunctionGroup as string ] );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind={ filterFunctionGroup }>
				<PropKeyProvider bind={ 'size' }>
					<PopoverGridContainer ref={ rowRef }>
						<Grid item xs={ 6 }>
							<ControlFormLabel>{ valueName }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 6 }>
							<SizeControl anchorRef={ rowRef } enablePropTypeUnits />
						</Grid>
					</PopoverGridContainer>
				</PropKeyProvider>
			</PropKeyProvider>
		</PropProvider>
	);
};
