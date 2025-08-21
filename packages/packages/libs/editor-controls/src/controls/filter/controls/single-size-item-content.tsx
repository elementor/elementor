// import { useRef } from 'react';
// import * as React from 'react';
// import { ControlFormLabel, type LengthUnit, SizeControl, type Unit } from '@elementor/editor-controls';
// import type { SizePropValue } from '@elementor/editor-props';
// import { Grid } from '@elementor/ui';
//
// import { PopoverGridContainer } from '../../../components/popover-grid-container';
//
// export const SingleSizeItemContent = ( { filterType }: { filterType: string } ) => {
// 	const { valueName, defaultValue, units } = filterConfig[ filterType ];
// 	const rowRef = useRef< HTMLDivElement >( null );
// 	const defaultUnit = ( defaultValue.value.args as SizePropValue ).value.unit;
//
// 	return (
// 		<PopoverGridContainer ref={ rowRef }>
// 			<Grid item xs={ 6 }>
// 				<ControlFormLabel>{ valueName }</ControlFormLabel>
// 			</Grid>
// 			<Grid item xs={ 6 }>
// 				<SizeControl anchorRef={ rowRef } units={ units as LengthUnit[] } defaultUnit={ defaultUnit as Unit } />
// 			</Grid>
// 		</PopoverGridContainer>
// 	);
// };
