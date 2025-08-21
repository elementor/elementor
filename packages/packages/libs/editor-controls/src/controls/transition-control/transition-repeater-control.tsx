import * as React from 'react';
import { useEffect, useState } from 'react';
import { selectionSizePropTypeUtil } from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { getSelectedElements } from '@elementor/editor-elements';

import { createControl } from '../../create-control';
import { repeaterEventBus, RepeaterEvents } from '../../services/repeater-event-bus';
import { sendMixpanelEvent, type MixpanelEvent } from '@elementor/utils';
import { RepeatableControl } from '../repeatable-control';
import { SelectionSizeControl } from '../selection-size-control';
import { initialTransitionValue, transitionProperties } from './data';
import { TransitionSelector } from './transition-selector';

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 'ms',
};

const transitionRepeaterMixpanelEvent = {
	eventName: 'click_added_transition',
	location: 'V4 Style Tab',
	secondaryLocation: 'Transition control',
	trigger: 'click',
}

// this config needs to be loaded at runtime/render since it's the transitionProperties object will be mutated by the pro plugin.
// See: https://elementor.atlassian.net/browse/ED-20285
const getSelectionSizeProps = ( recentlyUsedList: string[] ) => {
	return {
		selectionLabel: __( 'Type', 'elementor' ),
		sizeLabel: __( 'Duration', 'elementor' ),
		selectionConfig: {
			component: TransitionSelector,
			props: {
				recentlyUsedList,
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

function getChildControlConfig( recentlyUsedList: string[] ) {
	return {
		propTypeUtil: selectionSizePropTypeUtil,
		component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
		props: getSelectionSizeProps( recentlyUsedList ),
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

		React.useEffect( () => {
			const selectedElements = getSelectedElements();
			const widgetType = selectedElements[ 0 ].type ?? null;

			const unsubscribe = repeaterEventBus.subscribe( RepeaterEvents.TransitionItemAdded, ( data ) =>
				sendMixpanelEvent( { ...data as MixpanelEvent, ...transitionRepeaterMixpanelEvent, widget_type: widgetType } )
			);

			return unsubscribe;
		}, [] );

		useEffect( () => {
			recentlyUsedListGetter().then( setRecentlyUsedList );
		}, [ recentlyUsedListGetter ] );

		return (
			<RepeatableControl
				label={ __( 'Transitions', 'elementor' ) }
				repeaterLabel={ __( 'Transitions', 'elementor' ) }
				patternLabel="${value.selection.value.key.value}: ${value.size.value.size}${value.size.value.unit}"
				placeholder={ __( 'Empty Transition', 'elementor' ) }
				showDuplicate={ false }
				showToggle={ true }
				initialValues={ initialTransitionValue }
				childControlConfig={ getChildControlConfig( recentlyUsedList ) }
				propKey="transition"
				addItemTooltipProps={ {
					disabled: ! currentStyleIsNormal,
					enableTooltip: ! currentStyleIsNormal,
					tooltipContent: disableAddItemTooltipContent,
				} }
			/>
		);
	}
);
