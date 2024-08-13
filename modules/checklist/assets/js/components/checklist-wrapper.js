import { useState } from 'react';
import { List } from '@elementor/ui';
import { steps } from '../data/steps';
import CheckListItem from './checklist-item';

const ChecklistWrapper = () => {
	const [ expandedIndex, setExpandedIndex ] = useState( -1 );

	return (
		<List component="div" sx={ { py: 0 } }>
			{
				steps.map( ( step, index ) => {
					return (
						<CheckListItem step={ step } key={ index } setExpandedIndex={ setExpandedIndex } expandedIndex={ expandedIndex } index={ index } />
					);
				} )
			}
		</List>
	);
};

export default ChecklistWrapper;
