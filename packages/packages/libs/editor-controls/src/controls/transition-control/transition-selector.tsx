import * as React from 'react';
import { useRef } from 'react';
import { keyValuePropTypeUtil, type KeyValuePropValue, type StringPropValue } from '@elementor/editor-props';
import { ChevronDownIcon, VariationsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { ItemSelector } from '../../components/item-selector';
import ControlActions from '../../control-actions/control-actions';
import { transitionProperties, transitionsItemsList } from './data';

const toTransitionSelectorValue = ( label: string ) => {
	for ( const category of transitionProperties ) {
		const property = category.properties.find( ( prop ) => prop.label === label );
		if ( property ) {
			return {
				key: { value: property.label, $$type: 'string' },
				value: { value: property.value, $$type: 'string' },
			};
		}
	}

	return null;
};

export function getTransitionPropertyByValue( item?: StringPropValue | null ) {
	if ( ! item?.value ) {
		return null;
	}

	for ( const category of transitionProperties ) {
		for ( const property of category.properties ) {
			if ( property.value === item.value ) {
				return property;
			}
		}
	}

	return null;
}

const includeCurrentValueInOptions = ( value: KeyValuePropValue[ 'value' ], disabledItems: string[] ) => {
	return disabledItems.filter( ( item ) => {
		return item !== value.key.value;
	} );
};

export const TransitionSelector = ( {
	recentlyUsedList = [],
	disabledItems = [],
}: {
	recentlyUsedList: string[];
	disabledItems?: string[];
} ) => {
	const { value, setValue } = useBoundProp( keyValuePropTypeUtil );
	const {
		key: { value: transitionLabel },
	} = value;
	const defaultRef = useRef< HTMLDivElement >( null );
	const popoverState = usePopupState( { variant: 'popover' } );

	const getItemList = () => {
		const recentItems = recentlyUsedList
			.map( ( item ) => getTransitionPropertyByValue( { value: item, $$type: 'string' } )?.label )
			.filter( ( item ) => !! item ) as string[];
		const filteredItems = transitionsItemsList.map( ( category ) => {
			return {
				...category,
				items: category.items.filter( ( item ) => ! recentItems.includes( item ) ),
			};
		} );
		if ( recentItems.length === 0 ) {
			return filteredItems;
		}
		const [ first, ...rest ] = filteredItems;
		return [
			first,
			{
				label: __( 'Recently Used', 'elementor' ),
				items: recentItems,
			},
			...rest,
		];
	};

	const handleTransitionPropertyChange = ( newLabel: string ) => {
		const newValue = toTransitionSelectorValue( newLabel );

		if ( ! newValue ) {
			return;
		}

		setValue( newValue );
		popoverState.close();
	};

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
		<Box ref={ defaultRef }>
			<ControlActions>
				<UnstableTag
					variant="outlined"
					label={ transitionLabel }
					endIcon={ <ChevronDownIcon fontSize="tiny" /> }
					{ ...bindTrigger( popoverState ) }
					fullWidth
				/>
			</ControlActions>
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
					itemsList={ getItemList() }
					selectedItem={ transitionLabel }
					onItemChange={ handleTransitionPropertyChange }
					onClose={ popoverState.close }
					sectionWidth={ 268 }
					title={ __( 'Transition Property', 'elementor' ) }
					icon={ VariationsIcon as React.ElementType< { fontSize: string } > }
					disabledItems={ includeCurrentValueInOptions( value, disabledItems ) }
				/>
			</Popover>
		</Box>
	);
};
