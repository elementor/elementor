import * as React from 'react';
import { useState } from 'react';
import { usePopupState } from '@elementor/ui';

import { ItemSelector } from '../../components/item-selector';
import { transitionProperties } from './properties-data';

const itemsList = transitionProperties.map( ( category ) => ( {
	label: category.label,
	items: category.properties.map( ( prop ) => prop.label ),
} ) );

const title = 'Transition types';

export const TransitionControl = () => {
	const [ selectedItem, setSelectedItem ] = useState< string | null >( null );
	const popoverState = usePopupState( { variant: 'popover' } );

	// אם צריך להגדיר רוחב, אפשר לקבוע כאן קבוע או להשתמש ב־props במידה ויהיה
	const sectionWidth = 300; // לדוגמה, אפשר לשנות לפי הצורך

	return (
		<ItemSelector
			itemsList={ itemsList }
			selectedItem={ selectedItem }
			onItemChange={ setSelectedItem }
			onClose={ popoverState.close }
			sectionWidth={ sectionWidth }
			title={ title }
		/>
	);
};
