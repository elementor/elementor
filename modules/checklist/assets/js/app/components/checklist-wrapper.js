import { useState } from 'react';
import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import PropTypes from 'prop-types';
import SuccessMessage from './success-message';
import { isStepChecked } from '../../utils/functions';

const ChecklistWrapper = ( { steps, setSteps } ) => {
	const [ expandedIndex, setExpandedIndex ] = useState( -1 );
	const isChecklistCompleted = steps.filter( isStepChecked ).length === steps.length;

	return (
		<>
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
			{ isChecklistCompleted ? <SuccessMessage /> : null }
		</>
	);
};

export default ChecklistWrapper;

ChecklistWrapper.propTypes = {
	steps: PropTypes.array.isRequired,
	setSteps: PropTypes.func.isRequired,
};
