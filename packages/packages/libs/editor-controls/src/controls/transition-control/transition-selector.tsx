import * as React from 'react';
import { useRef } from 'react';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon, VariationsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { ItemSelector } from '../../components/item-selector';
import { transitionProperties } from './data';

const TRANSITION_ITEMS_LIST = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( property ) => property.label ),
} ) );

const getTransitionPropertyValue = ( label: string ) => {
	for ( const category of transitionProperties ) {
		const property = category.properties.find( ( prop ) => prop.label === label );
		if ( property ) {
			return property.value;
		}
	}

	return null;
};

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

export const TransitionSelector = () => {
	const { value, setValue } = useBoundProp( stringPropTypeUtil );
	const defaultRef = useRef< HTMLDivElement >( null );
	const popoverState = usePopupState( { variant: 'popover' } );

	const handleTransitionPropertyChange = ( newLabel: string ) => {
		const newValue = getTransitionPropertyValue( newLabel );

		setValue( newValue );
		popoverState.close();
	};

	const displayLabel = getTransitionPropertyLabel( value );

	const getAnchorPosition = () => {
		if ( ! defaultRef.current ) {
			return undefined;
		}

		const rect = defaultRef.current.getBoundingClientRect();
		return {
			top: rect.top,
			left: rect.right + 36,
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
					icon={ VariationsIcon as React.ElementType< { fontSize: string } > }
				/>
			</Popover>
		</div>
	);
};
