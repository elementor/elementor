import { useState } from 'react';
import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import PropTypes from 'prop-types';

const ChecklistWrapper = ( { steps, setSteps } ) => {
	const [ expandedIndex, setExpandedIndex ] = useState( -1 );

	return (
		<List component="div" sx={ { py: 0 } }>
			{
				steps.map( ( step, index ) => {
					return (
						<CheckListItem
							key={ index }
							step={ step }
							setSteps={ setSteps }
							setExpandedIndex={ setExpandedIndex }
							expandedIndex={ expandedIndex }
							index={ index }
						/>
					);
				} )
			}
		</List>
	);
};

export default ChecklistWrapper;

ChecklistWrapper.propTypes = {
	steps: PropTypes.array.isRequired,
	setSteps: PropTypes.func.isRequired,
};
