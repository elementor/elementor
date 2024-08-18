import { useState } from 'react';
import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import PropTypes from "prop-types";
import Header from "./header";

const ChecklistWrapper = ( { steps } ) => {
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

ChecklistWrapper.propTypes = {
	step: PropTypes.object.isRequired,
}
