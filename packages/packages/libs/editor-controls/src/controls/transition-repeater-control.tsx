import * as React from 'react';
import { useRef } from 'react';
import { selectionSizePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon, SettingsIcon } from '@elementor/icons'; // todo change to VariationsIcon when available
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { ItemSelector } from '../components/item-selector';
import { transitionProperties } from '../components/transitions/properties-data';
import { createControl } from '../create-control';
import { RepeatableControl } from './repeatable-control';
import { SelectionSizeControl } from './selection-size-control';

// Transform transition properties data for ItemSelector
const TRANSITION_ITEMS_LIST = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.value ),
} ) );

// Find the label for a transition property value
const getTransitionPropertyLabel = ( value: string | null ) => {
	if ( ! value ) {
		return '';
	}

	for ( const category of transitionProperties ) {
		const property = category.properties.find( ( prop ) => prop.value === value );
		if ( property ) {
			return property.label;
		}
	}
	return value;
};

// Transition Property Selector Component
const TransitionPropertySelector = () => {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	const defaultRef = useRef< HTMLDivElement >( null );
	const popoverState = usePopupState( { variant: 'popover' } );

	const handleTransitionPropertyChange = ( newValue: string ) => {
		setValue( newValue );
		popoverState.close();
	};

	const displayLabel = getTransitionPropertyLabel( value );

	// Calculate anchor position based on UnstableTag dimensions
	const getAnchorPosition = () => {
		if ( ! defaultRef.current ) {
			return undefined;
		}

		const rect = defaultRef.current.getBoundingClientRect();
		return {
			top: rect.top,
			left: rect.right + 36, // 36px to the right of the tag
		};
	};

	return (
		<div ref={ defaultRef }>
			<UnstableTag
				variant="outlined"
				label={ displayLabel || __( 'Select Property', 'elementor' ) }
				endIcon={ <ChevronDownIcon fontSize="tiny" /> }
				{ ...bindTrigger( popoverState ) }
				fullWidth
			/>
			<Popover
				disablePortal
				disableScrollLock
				{ ...bindPopover( popoverState ) }
				anchorReference="anchorPosition"
				anchorPosition={ getAnchorPosition() }
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
			>
				<ItemSelector
					itemsList={ TRANSITION_ITEMS_LIST }
					selectedItem={ value }
					onItemChange={ handleTransitionPropertyChange }
					onClose={ popoverState.close }
					sectionWidth={ 268 }
					title={ __( 'Transition Property', 'elementor' ) }
					itemStyle={ () => ( {} ) }
					onDebounce={ () => {} }
					icon={ SettingsIcon as React.ElementType< { fontSize: string } > }
				/>
			</Popover>
		</div>
	);
};

const DURATION_CONFIG = {
	variant: 'time',
	units: [ 's', 'ms' ],
	defaultUnit: 'ms',
};

const INITIAL_VALUES = {
	selection: { $$type: 'string', value: 'all' },
	size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
};

const SELECTION_SIZE_PROPS = {
	selectionLabel: 'Type',
	sizeLabel: 'Duration',
	selectionConfig: {
		component: TransitionPropertySelector,
		props: {},
	},
	sizeConfigMap: {
		// Create size config for all transition properties
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

const CHILD_CONTROL_CONFIG = {
	propTypeUtil: selectionSizePropTypeUtil,
	component: SelectionSizeControl as unknown as React.ComponentType< Record< string, unknown > >,
	props: SELECTION_SIZE_PROPS,
};

export const TransitionRepeaterControl = createControl( () => {
	return (
		<RepeatableControl
			label="Transitions"
			repeaterLabel="Transitions"
			patternLabel="${value.selection.value}: ${value.size.value.size}${value.size.value.unit}"
			placeholder="Empty Transition"
			showDuplicate={ false }
			showToggle={ true }
			initialValues={ INITIAL_VALUES }
			childControlConfig={ CHILD_CONTROL_CONFIG }
			propKey="transition"
		/>
	);
} );
