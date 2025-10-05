import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createArrayPropUtils, selectionSizePropTypeUtil, type SelectionSizePropValue } from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { createControl } from '../../create-control';
import { RepeatableControl } from '../repeatable-control';
import { SelectionSizeControl } from '../selection-size-control';
import { initialTransitionValue, transitionProperties } from './data';
import { subscribeToTransitionEvent } from './trainsition-events';
import { TransitionSelector } from './transition-selector';

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 'ms',
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

function getChildControlConfig( recentlyUsedList: string[], disabledItems?: string[] ) {
	return {
		propTypeUtil: selectionSizePropTypeUtil,
		component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
		props: getSelectionSizeProps( recentlyUsedList, disabledItems ),
	};
}

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

subscribeToTransitionEvent();

const getTransitionLabel = ( item: SelectionSizePropValue ) => {
	return ( item.value.selection.value as { key: { value: string } } )?.key?.value ?? '';
};

const getDisabledItems = ( value: SelectionSizePropValue[] | null | undefined ) => {
	return value?.map( getTransitionLabel ) ?? [];
};

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

		const childArrayPropTypeUtil = useMemo(
			() => createArrayPropUtils( selectionSizePropTypeUtil.key, selectionSizePropTypeUtil.schema, 'transition' ),
			[]
		);

		const { value, setValue } = useBoundProp( childArrayPropTypeUtil );
		const disabledItems = useMemo( () => getDisabledItems( value ), [ value ] );

		const allowedTransitionValues = useMemo(
			() => transitionProperties.flatMap( ( category ) => category.properties.map( ( prop ) => prop.value ) ),
			[]
		);

		useEffect( () => {
			if ( ! value || value.length === 0 ) {
				return;
			}
			const sanitized = value.filter( ( item ) => {
				const selectionValue =
					( item?.value?.selection?.value as { value?: { value?: string } } )?.value?.value ?? '';
				return allowedTransitionValues.includes( selectionValue );
			} );

			if ( sanitized.length !== value.length ) {
				setValue( sanitized );
			}
		}, [ value, setValue, allowedTransitionValues ] );

		useEffect( () => {
			recentlyUsedListGetter().then( setRecentlyUsedList );
		}, [ recentlyUsedListGetter ] );

		const allPropertiesUsed = value?.length === transitionProperties.length;

		return (
			<RepeatableControl
				label={ __( 'Transitions', 'elementor' ) }
				repeaterLabel={ __( 'Transitions', 'elementor' ) }
				patternLabel="${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}"
				placeholder={ __( 'Empty Transition', 'elementor' ) }
				showDuplicate={ false }
				showToggle={ true }
				initialValues={ initialTransitionValue }
				childControlConfig={ getChildControlConfig( recentlyUsedList, disabledItems ) }
				propKey="transition"
				addItemTooltipProps={ {
					disabled: ! currentStyleIsNormal || allPropertiesUsed,
					enableTooltip: ! currentStyleIsNormal,
					tooltipContent: disableAddItemTooltipContent,
				} }
			/>
		);
	}
);
