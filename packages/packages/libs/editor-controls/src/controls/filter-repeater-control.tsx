import * as React from 'react';
import { useRef } from 'react';
import {
	blurFilterPropTypeUtil,
	brightnessFilterPropTypeUtil,
	contrastFilterPropTypeUtil,
	type FilterItemPropValue,
	filterPropTypeUtil,
	grayscaleFilterPropTypeUtil,
	hueRotateFilterPropTypeUtil,
	invertFilterPropTypeUtil,
	type PropKey,
	type PropTypeUtil,
	saturateFilterPropTypeUtil,
	sepiaFilterPropTypeUtil,
	type SizePropValue,
} from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { Box, Grid, Select, type SelectChangeEvent } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlLabel } from '../components/control-label';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { Repeater } from '../components/repeater';
import { createControl } from '../create-control';
import { defaultUnits } from '../utils/size-control';
import { SizeControl } from './size-control';

type FilterType = FilterItemPropValue[ '$$type' ];
type FilterValue = FilterItemPropValue[ 'value' ];

const DEFAULT_FILTER_KEY: FilterType = 'blur';

type FilterItemConfig = {
	defaultValue: FilterValue;
	name: string;
	valueName: string;
	propType: PropTypeUtil< FilterValue, FilterValue >;
	units?: Exclude< SizePropValue[ 'value' ][ 'unit' ], 'custom' | 'auto' >[];
};

const filterConfig: Record< FilterType, FilterItemConfig > = {
	blur: {
		defaultValue: { $$type: 'radius', radius: { $$type: 'size', value: { size: 0, unit: 'px' } } },
		name: __( 'Blur', 'elementor' ),
		valueName: __( 'Radius', 'elementor' ),
		propType: blurFilterPropTypeUtil,
		units: defaultUnits.filter( ( unit ) => unit !== '%' ),
	},
	brightness: {
		defaultValue: { $$type: 'amount', amount: { $$type: 'size', value: { size: 100, unit: '%' } } },
		name: __( 'Brightness', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: brightnessFilterPropTypeUtil,
		units: [ '%' ],
	},
	contrast: {
		defaultValue: { $$type: 'contrast', contrast: { $$type: 'size', value: { size: 100, unit: '%' } } },
		name: __( 'Contrast', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: contrastFilterPropTypeUtil,
		units: [ '%' ],
	},
	grayscale: {
		defaultValue: { $$type: 'grayscale', grayscale: { $$type: 'size', value: { size: 0, unit: '%' } } },
		name: __( 'Grayscale', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: grayscaleFilterPropTypeUtil,
		units: [ '%' ],
	},
	invert: {
		defaultValue: { $$type: 'invert', invert: { $$type: 'size', value: { size: 0, unit: '%' } } },
		name: __( 'Invert', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: invertFilterPropTypeUtil,
		units: [ '%' ],
	},
	saturate: {
		defaultValue: { $$type: 'saturate', saturate: { $$type: 'size', value: { size: 100, unit: '%' } } },
		name: __( 'Saturate', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: saturateFilterPropTypeUtil,
		units: [ '%' ],
	},
	sepia: {
		defaultValue: { $$type: 'sepia', sepia: { $$type: 'size', value: { size: 0, unit: '%' } } },
		name: __( 'Sepia', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		propType: sepiaFilterPropTypeUtil,
		units: [ '%' ],
	},
	'hue-rotate': {
		defaultValue: { $$type: 'hue-rotate', 'hue-rotate': { $$type: 'size', value: { size: 0, unit: 'deg' } } },
		name: __( 'Hue Rotate', 'elementor' ),
		valueName: __( 'Angle', 'elementor' ),
		propType: hueRotateFilterPropTypeUtil,
		units: [ 'deg', 'rad', 'grad', 'turn' ],
	},
};

const filterKeys = Object.keys( filterConfig ) as FilterType[];

const singleSizeFilterNames = filterKeys.filter( ( name ) => {
	const filter = filterConfig[ name as FilterType ].defaultValue;

	return filter[ filter.$$type ].$$type === 'size';
} ) as FilterType[];

export const FilterRepeaterControl = createControl( () => {
	const { propType, value: filterValues, setValue, disabled } = useBoundProp( filterPropTypeUtil );

	return (
		<PropProvider propType={ propType } value={ filterValues } setValue={ setValue }>
			<Repeater
				openOnAdd
				disabled={ disabled }
				values={ filterValues ?? [] }
				setValues={ setValue }
				label={ __( 'Filter', 'elementor' ) }
				itemSettings={ {
					Icon: ItemIcon,
					Label: ItemLabel,
					Content: ItemContent,
					initialValues: {
						$$type: DEFAULT_FILTER_KEY,
						value: filterConfig[ DEFAULT_FILTER_KEY ].defaultValue,
					} as FilterItemPropValue,
				} }
			/>
		</PropProvider>
	);
} );

const ItemIcon = () => <></>;

const ItemLabel = ( props: { value: FilterItemPropValue } ) => {
	const { $$type } = props.value;

	return singleSizeFilterNames.includes( $$type ) && <SingleSizeItemLabel value={ props.value } />;
};

const SingleSizeItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const { $$type, value: sizeValue } = value;
	const { $$type: key } = filterConfig[ $$type ].defaultValue;
	const defaultUnit = filterConfig[ $$type ].defaultValue[ key ].value.unit;
	const { unit, size } = sizeValue[ key ]?.value ?? { unit: defaultUnit, size: 0 };

	const label = (
		<Box component="span" style={ { textTransform: 'capitalize' } }>
			{ value.$$type }:
		</Box>
	);

	return (
		<Box component="span">
			{ label }
			{ unit !== 'custom' ? ` ${ size ?? 0 }${ unit ?? defaultUnit }` : size }
		</Box>
	);
};

const ItemContent = ( { bind }: { bind: PropKey } ) => {
	const { value: filterValues, setValue } = useBoundProp( filterPropTypeUtil );
	const itemIndex = parseInt( bind, 10 );
	const item = filterValues?.[ itemIndex ];

	const handleChange = ( e: SelectChangeEvent< string > ) => {
		const newFilterValues = [ ...filterValues ];
		const filterType = e.target.value as FilterType;

		newFilterValues[ itemIndex ] = {
			$$type: filterType,
			value: { ...filterConfig[ filterType ].defaultValue },
		} as FilterItemPropValue;

		setValue( newFilterValues );
	};

	return (
		<PropKeyProvider bind={ bind }>
			<PopoverContent p={ 1.5 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlLabel>{ __( 'Filter', 'elementor' ) }</ControlLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<Select
							sx={ { overflow: 'hidden' } }
							size="tiny"
							value={ item?.$$type ?? DEFAULT_FILTER_KEY }
							onChange={ handleChange }
							fullWidth
						>
							{ filterKeys.map( ( filterKey ) => (
								<MenuListItem key={ filterKey } value={ filterKey }>
									{ filterConfig[ filterKey ].name }
								</MenuListItem>
							) ) }
						</Select>
					</Grid>
				</PopoverGridContainer>
				<Content filterType={ item?.$$type } />
			</PopoverContent>
		</PropKeyProvider>
	);
};

const Content = ( { filterType }: { filterType: FilterType } ) => {
	return singleSizeFilterNames.includes( filterType ) && <SingleSizeItemContent filterType={ filterType } />;
};

const SingleSizeItemContent = ( { filterType }: { filterType: FilterType } ) => {
	const { propType, valueName, defaultValue, units } = filterConfig[ filterType ];
	const { $$type } = defaultValue;
	const context = useBoundProp( propType );
	const rowRef = useRef< HTMLDivElement >( null );
	const defaultUnit = defaultValue[ $$type ].value.unit;

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind={ $$type }>
				<PopoverGridContainer ref={ rowRef }>
					<Grid item xs={ 6 }>
						<ControlLabel>{ valueName }</ControlLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<SizeControl anchorRef={ rowRef } units={ units } defaultUnit={ defaultUnit } />
					</Grid>
				</PopoverGridContainer>
			</PropKeyProvider>
		</PropProvider>
	);
};
