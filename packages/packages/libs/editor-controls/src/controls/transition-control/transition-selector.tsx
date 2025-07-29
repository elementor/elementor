import * as React from 'react';
import { useRef } from 'react';
import { keyValuePropTypeUtil } from '@elementor/editor-props';
import { ChevronDownIcon, VariationsIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, UnstableTag, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../bound-prop-context';
import { ItemSelector } from '../../components/item-selector';
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

export const TransitionSelector = () => {
	const { value, setValue } = useBoundProp( keyValuePropTypeUtil );
	const {
		value: { value: transitionValue },
		key: { value: transitionLabel },
	} = value;
	const defaultRef = useRef< HTMLDivElement >( null );
	const popoverState = usePopupState( { variant: 'popover' } );

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
			<UnstableTag
				variant="outlined"
				label={ transitionLabel }
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
					itemsList={ transitionsItemsList }
					selectedItem={ transitionValue }
					onItemChange={ handleTransitionPropertyChange }
					onClose={ popoverState.close }
					sectionWidth={ 268 }
					title={ __( 'Transition Property', 'elementor' ) }
					icon={ VariationsIcon as React.ElementType< { fontSize: string } > }
				/>
			</Popover>
		</Box>
	);
};
