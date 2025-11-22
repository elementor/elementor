import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
	createArrayPropUtils,
	type KeyValuePropValue,
	selectionSizePropTypeUtil,
	type SelectionSizePropValue,
} from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { type Item, type RepeatablePropValue } from '../../components/control-repeater/types';
import { createControl } from '../../create-control';
import { RepeatableControl } from '../repeatable-control';
import { SelectionSizeControl } from '../selection-size-control';
import {
	initialTransitionValue,
	type TransitionItem,
	transitionProperties,
	type TransitionProperty,
	type TransitionValue,
} from './data';
import { subscribeToTransitionEvent } from './trainsition-events';
import { getTransitionPropertyByValue, TransitionSelector } from './transition-selector';

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 'ms',
};

const childArrayPropTypeUtil = createArrayPropUtils(
	selectionSizePropTypeUtil.key,
	selectionSizePropTypeUtil.schema,
	'transition'
);

subscribeToTransitionEvent();

const areAllPropertiesUsed = ( value: SelectionSizePropValue[] = [] ) => {
	return value?.length
		? transitionProperties.every( ( category ) => {
				return category.properties.every( ( property ) => {
					return (
						property.isDisabled ||
						!! value?.find( ( item ) => {
							return (
								( item.value?.selection?.value as KeyValuePropValue )?.value?.value === property.value
							);
						} )
					);
				} );
		  } )
		: false;
};

// this config needs to be loaded at runtime/render since it's the transitionProperties object will be mutated by the pro plugin.
// See: https://elementor.atlassian.net/browse/ED-20285
const getSelectionSizeProps = ( recentlyUsedList: string[], disabledItems?: string[] ) => {
	return {
		selectionLabel: __( 'Type', 'elementor' ),
		sizeLabel: __( 'Duration', 'elementor' ),
		selectionConfig: {
			component: TransitionSelector,
			props: {
				recentlyUsedList,
				disabledItems,
			},
		},
		isRepeaterControl: true,
		sizeConfigMap: {
			...transitionProperties.reduce(
				( acc, category ) => {
					category.properties.forEach( ( property ) => {
						acc[ property.value ] = DURATION_CONFIG;
					} );
					return acc;
				},
				{} as Record< string, typeof DURATION_CONFIG >
			),
		},
	};
};

const isItemDisabled = ( item: TransitionItem[ 'value' ] ) => {
	const property = getTransitionPropertyByValue( item.value.selection.value?.value );

	return ! property ? false : !! property.isDisabled;
};

const getChildControlConfig = ( recentlyUsedList: string[], disabledItems?: string[] ) => {
	return {
		propTypeUtil: selectionSizePropTypeUtil,
		component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
		props: getSelectionSizeProps( recentlyUsedList, disabledItems ),
		isItemDisabled: isItemDisabled as ( item: Item< RepeatablePropValue > ) => boolean,
	};
};

const isPropertyUsed = ( value: SelectionSizePropValue[], property: TransitionProperty ) => {
	return ( value ?? [] ).some( ( item ) => {
		return ( item?.value?.selection?.value as KeyValuePropValue )?.value?.value === property.value;
	} );
};

const getDisabledItemLabels = ( values: SelectionSizePropValue[] = [] ) => {
	const disabledLabels: string[] = ( values || [] ).map(
		( item ) => ( item.value?.selection as KeyValuePropValue )?.value?.key?.value
	);

	transitionProperties.forEach( ( category ) => {
		const disabledProperties = category.properties
			.filter( ( property ) => property.isDisabled && ! disabledLabels.includes( property.label ) )
			.map( ( property ) => property.label );

		disabledLabels.push( ...disabledProperties );
	} );

	return disabledLabels;
};

const getInitialValue = ( values: SelectionSizePropValue[] = [] ): TransitionValue => {
	if ( ! values?.length ) {
		return initialTransitionValue;
	}

	for ( const category of transitionProperties ) {
		for ( const property of category.properties ) {
			if ( isPropertyUsed( values, property ) ) {
				continue;
			}

			return {
				...initialTransitionValue,
				selection: {
					$$type: 'key-value',
					value: {
						key: { value: property.label, $$type: 'string' },
						value: { value: property.value, $$type: 'string' },
					},
				},
			};
		}
	}

	return initialTransitionValue;
};

const disableAddItemTooltipContent = (
	<Alert
		sx={ {
			width: 280,
			gap: 0.5,
		} }
		color="secondary"
		icon={ <InfoCircleFilledIcon /> }
	>
		<AlertTitle>{ __( 'Transitions', 'elementor' ) }</AlertTitle>
		<Box component="span">
			<Typography variant="body2">
				{ __( "Switch to 'Normal' state to add a transition.", 'elementor' ) }
			</Typography>
		</Box>
	</Alert>
);

export const TransitionRepeaterControl = createControl(
	( {
		recentlyUsedListGetter,
		currentStyleState,
	}: {
		recentlyUsedListGetter: () => Promise< string[] >;
		currentStyleState: StyleDefinitionState;
	} ) => {
		const currentStyleIsNormal = currentStyleState === null;
		const [ recentlyUsedList, setRecentlyUsedList ] = useState< string[] >( [] );

		const { value, setValue } = useBoundProp( childArrayPropTypeUtil );
		const disabledItems = useMemo( () => getDisabledItemLabels( value ), [ value ] );

		const allowedTransitionSet = useMemo( () => {
			const set = new Set< string >();
			transitionProperties.forEach( ( category ) => {
				category.properties.forEach( ( prop ) => set.add( prop.value ) );
			} );
			return set;
		}, [] );

		useEffect( () => {
			if ( ! value || value.length === 0 ) {
				return;
			}

			const sanitized = value.filter( ( item ) => {
				const selectionValue = ( item?.value?.selection?.value as KeyValuePropValue )?.value?.value ?? '';
				return allowedTransitionSet.has( selectionValue );
			} );

			if ( sanitized.length !== value.length ) {
				setValue( sanitized );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ allowedTransitionSet ] );

		useEffect( () => {
			recentlyUsedListGetter().then( setRecentlyUsedList );
		}, [ recentlyUsedListGetter ] );

		const allPropertiesUsed = useMemo( () => areAllPropertiesUsed( value ), [ value ] );
		const isAddItemDisabled = ! currentStyleIsNormal || allPropertiesUsed;

		return (
			<RepeatableControl
				label={ __( 'Transitions', 'elementor' ) }
				repeaterLabel={ __( 'Transitions', 'elementor' ) }
				patternLabel="${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}"
				placeholder={ __( 'Empty Transition', 'elementor' ) }
				showDuplicate={ false }
				showToggle={ true }
				initialValues={ getInitialValue( value ) }
				childControlConfig={ getChildControlConfig( recentlyUsedList, disabledItems ) }
				propKey="transition"
				addItemTooltipProps={ {
					disabled: isAddItemDisabled,
					enableTooltip: ! currentStyleIsNormal,
					tooltipContent: disableAddItemTooltipContent,
				} }
			/>
		);
	}
);
