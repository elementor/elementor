import { useState } from 'react';
import List from '@elementor/ui/List';
import { steps } from '../data/steps';
import CheckListItem from './checklist-item';

function ChecklistWrapper() {
	const [ expandedIndex, setExpandedIndex ] = useState( 0 );

	return (
		<List component="div" sx={ { py: 0 } }>
			{
				steps.map( ( step, index ) => {
					return (
						<CheckListItem step={ step } key={ index } setExpandedIndex={ setExpandedIndex } expandedIndex={ expandedIndex } />
					);
				} )
			}
		</List>
	);
}

export default ChecklistWrapper;
