import * as React from 'react';
import { useRef } from 'react';
import { dropShadowFilterPropTypeUtil } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { PopoverGridContainer } from '../../components/popover-grid-container';
import { type LengthUnit } from '../../utils/size-control';
import { ColorControl } from '../color-control';
import { SizeControl } from '../size-control';

const items = [
	{
		bind: 'xAxis',
		label: __( 'X-axis', 'elementor' ),
		rowIndex: 0,
	},
	{
		bind: 'yAxis',
		label: __( 'Y-axis', 'elementor' ),
		rowIndex: 0,
	},
	{
		bind: 'blur',
		label: __( 'Blur', 'elementor' ),
		rowIndex: 1,
	},
	{
		bind: 'color',
		label: __( 'Color', 'elementor' ),
		rowIndex: 1,
	},
];

export const DropShadowItemContent = ( {
	units,
	anchorEl,
}: {
	units: LengthUnit[];
	anchorEl?: HTMLElement | null;
} ) => {
	const context = useBoundProp( dropShadowFilterPropTypeUtil );
	const rowRefs = [ useRef< HTMLDivElement >( null ), useRef< HTMLDivElement >( null ) ];

	return (
		<PropProvider { ...context }>
			{ items.map( ( item ) => (
				<PopoverGridContainer key={ item.bind } ref={ rowRefs[ item.rowIndex ] ?? null }>
					<PropKeyProvider bind={ item.bind }>
						<Grid item xs={ 6 }>
							<ControlFormLabel>{ item.label }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 6 }>
							{ item.bind === 'color' ? (
								<ColorControl anchorEl={ anchorEl } />
							) : (
								<SizeControl anchorRef={ rowRefs[ item.rowIndex ] } units={ units } defaultUnit="px" />
							) }
						</Grid>
					</PropKeyProvider>
				</PopoverGridContainer>
			) ) }
		</PropProvider>
	);
};
