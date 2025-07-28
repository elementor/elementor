import * as React from 'react';
import { useRef } from 'react';
import {
	type CreateOptions,
	cssFilterFunctionPropUtil,
	type FilterItemPropValue,
	filterPropTypeUtil,
	type PropKey,
	type SizePropValue,
} from '@elementor/editor-props';
import { backdropFilterPropTypeUtil } from '@elementor/editor-props';
import { Box, Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { PopoverContent } from '../components/popover-content';
import { PopoverGridContainer } from '../components/popover-grid-container';
import { type CollectionPropUtil, Repeater } from '../components/repeater';
import { createControl } from '../create-control';
import { type LengthUnit, lengthUnits, type Unit } from '../utils/size-control';
import { DropShadowItemContent } from './filter-control/drop-shadow-item-content';
import { DropShadowItemLabel } from './filter-control/drop-shadow-item-label';
import { SelectControl } from './select-control';
import { SizeControl, type SizeControlProps } from './size-control';

type FilterType = FilterItemPropValue[ 'value' ][ 'func' ];

const DEFAULT_FILTER = 'blur';

type FilterItemConfig = {
	defaultValue: FilterItemPropValue;
	name: string;
	valueName: string;
	units?: Exclude< SizePropValue[ 'value' ][ 'unit' ], 'custom' | 'auto' >[];
	sizeVariant?: SizeControlProps[ 'variant' ];
};

const filterConfig: Record< string, FilterItemConfig > = {
	blur: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'blur' },
				args: { $$type: 'size', value: { size: 0, unit: 'px' } },
			},
		},
		name: __( 'Blur', 'elementor' ),
		valueName: __( 'Radius', 'elementor' ),
		units: lengthUnits.filter( ( unit ) => unit !== '%' ),
	},
	brightness: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'brightness' },
				args: { $$type: 'size', value: { size: 100, unit: '%' } },
			},
		},
		name: __( 'Brightness', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	contrast: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'contrast' },
				args: { $$type: 'size', value: { size: 100, unit: '%' } },
			},
		},
		name: __( 'Contrast', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	'hue-rotate': {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'hue-rotate' },
				args: { $$type: 'size', value: { size: 0, unit: 'deg' } },
			},
		},
		name: __( 'Hue Rotate', 'elementor' ),
		valueName: __( 'Angle', 'elementor' ),
		units: [ 'deg', 'rad', 'grad', 'turn' ],
	},
	saturate: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'saturate' },
				args: { $$type: 'size', value: { size: 100, unit: '%' } },
			},
		},
		name: __( 'Saturate', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	grayscale: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'grayscale' },
				args: { $$type: 'size', value: { size: 0, unit: '%' } },
			},
		},
		name: __( 'Grayscale', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	invert: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'invert' },
				args: { $$type: 'size', value: { size: 0, unit: '%' } },
			},
		},
		name: __( 'Invert', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	sepia: {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'sepia' },
				args: { $$type: 'size', value: { size: 0, unit: '%' } },
			},
		},
		name: __( 'Sepia', 'elementor' ),
		valueName: __( 'Amount', 'elementor' ),
		units: [ '%' ],
	},
	'drop-shadow': {
		defaultValue: {
			$$type: 'css-filter-func',
			value: {
				func: { $$type: 'string', value: 'drop-shadow' },
				args: {
					$$type: 'drop-shadow',
					value: {
						xAxis: { $$type: 'size', value: { size: 0, unit: 'px' } },
						yAxis: { $$type: 'size', value: { size: 0, unit: 'px' } },
						blur: { $$type: 'size', value: { size: 10, unit: 'px' } },
						color: { $$type: 'color', value: 'rgba(0, 0, 0, 1)' },
					},
				},
			},
		},
		name: __( 'Drop shadow', 'elementor' ),
		valueName: __( 'Drop-shadow', 'elementor' ),
		units: lengthUnits.filter( ( unit ) => unit !== '%' ),
	},
};

const filterKeys = Object.keys( filterConfig );

const isSingleSize = ( key: string ): boolean => {
	return ! [ 'drop-shadow' ].includes( key );
};

export const FilterRepeaterControl = createControl( ( { filterPropName = 'filter' }: { filterPropName?: string } ) => {
	const [ propUtil, label ] =
		filterPropName === 'backdrop-filter'
			? [ backdropFilterPropTypeUtil, __( 'Backdrop Filters', 'elementor' ) ]
			: [ filterPropTypeUtil, __( 'Filters', 'elementor' ) ];
	const { propType, value: filterValues, setValue, disabled } = useBoundProp( propUtil );

	return (
		<PropProvider propType={ propType } value={ filterValues } setValue={ setValue }>
			<Repeater
				openOnAdd
				disabled={ disabled }
				values={ filterValues ?? [] }
				setValues={ setValue }
				label={ label }
				collectionPropUtil={ propUtil }
				itemSettings={ {
					Icon: ItemIcon,
					Label: ItemLabel,
					Content: ItemContent,
					initialValues: filterConfig[ DEFAULT_FILTER ].defaultValue,
				} }
			/>
		</PropProvider>
	);
} );

const ItemIcon = () => <></>;

const ItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	return isSingleSize( value.value.func.value ?? '' ) ? (
		<SingleSizeItemLabel value={ value } />
	) : (
		<DropShadowItemLabel value={ value } />
	);
};

const SingleSizeItemLabel = ( { value }: { value: FilterItemPropValue } ) => {
	const { func, args } = value.value;
	const defaultUnit =
		( filterConfig[ func.value ?? '' ].defaultValue.value.args as SizePropValue ).value.unit ?? lengthUnits[ 0 ];
	const { unit, size } = ( args as SizePropValue ).value ?? { unit: defaultUnit, size: 0 };

	const label = (
		<Box component="span" style={ { textTransform: 'capitalize' } }>
			{ func.value ?? '' }:
		</Box>
	);

	return (
		<Box component="span">
			{ label }
			{ unit !== 'custom' ? ` ${ size ?? 0 }${ unit ?? defaultUnit }` : size }
		</Box>
	);
};

const ItemContent = ( {
	bind,
	collectionPropUtil,
	anchorEl,
}: {
	bind: PropKey;
	collectionPropUtil?: CollectionPropUtil< FilterItemPropValue >;
	anchorEl?: HTMLElement | null;
} ) => {
	const { value: filterValues = [] } = useBoundProp( collectionPropUtil ?? filterPropTypeUtil );
	const itemIndex = parseInt( bind, 10 );
	const item = filterValues?.[ itemIndex ];
	return item ? (
		<PropKeyProvider bind={ bind }>
			<PropContent item={ item } anchorEl={ anchorEl } />
		</PropKeyProvider>
	) : null;
};

const PropContent = ( { item, anchorEl }: { item: FilterItemPropValue; anchorEl?: HTMLElement | null } ) => {
	const propContext = useBoundProp( cssFilterFunctionPropUtil );

	const handleValueChange = (
		changedValue: FilterItemPropValue[ 'value' ],
		options?: CreateOptions,
		meta?: { bind?: PropKey }
	) => {
		let newValue = structuredClone( changedValue );
		const newFuncName = newValue?.func.value ?? '';
		if ( meta?.bind === 'func' ) {
			newValue = structuredClone( filterConfig[ newFuncName ].defaultValue.value );
		}

		if ( ! newValue.args ) {
			return;
		}
		propContext.setValue( newValue );
	};

	return (
		<PropProvider { ...propContext } setValue={ handleValueChange }>
			<PopoverContent p={ 1.5 }>
				<PopoverGridContainer>
					<Grid item xs={ 6 }>
						<ControlFormLabel>{ __( 'Filter', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 6 }>
						<PropKeyProvider bind="func">
							<SelectControl
								options={ filterKeys.map( ( filterKey ) => ( {
									label: filterConfig[ filterKey ].name,
									value: filterKey,
								} ) ) }
							/>
						</PropKeyProvider>
					</Grid>
				</PopoverGridContainer>
				<PropKeyProvider bind="args">
					<Content filterType={ item?.value.func } anchorEl={ anchorEl } />
				</PropKeyProvider>
			</PopoverContent>
		</PropProvider>
	);
};

const Content = ( { filterType, anchorEl }: { filterType: FilterType; anchorEl?: HTMLElement | null } ) => {
	const filterName = filterType?.value || DEFAULT_FILTER;
	const filterItemConfig = filterConfig[ filterName ];
	const { units = [] } = filterItemConfig;

	return isSingleSize( filterName ) ? (
		<SingleSizeItemContent filterType={ filterName } />
	) : (
		<DropShadowItemContent units={ units as LengthUnit[] } anchorEl={ anchorEl } />
	);
};

const SingleSizeItemContent = ( { filterType }: { filterType: string } ) => {
	const { valueName, defaultValue, units } = filterConfig[ filterType ];
	const rowRef = useRef< HTMLDivElement >( null );
	const defaultUnit = ( defaultValue.value.args as SizePropValue ).value.unit;
	return (
		<PopoverGridContainer ref={ rowRef }>
			<Grid item xs={ 6 }>
				<ControlFormLabel>{ valueName }</ControlFormLabel>
			</Grid>
			<Grid item xs={ 6 }>
				<SizeControl anchorRef={ rowRef } units={ units as LengthUnit[] } defaultUnit={ defaultUnit as Unit } />
			</Grid>
		</PopoverGridContainer>
	);
};
