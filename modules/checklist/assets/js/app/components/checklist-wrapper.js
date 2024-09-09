import { useState } from 'react';
import { List } from '@elementor/ui';
import CheckListItem from './checklist-item';
import PropTypes from 'prop-types';
import SuccessMessage from './success-message';
import { isStepChecked } from '../../utils/functions';

const ChecklistWrapper = ( { steps, setSteps } ) => {
	const [ expandedIndex, setExpandedIndex ] = useState( -1 );
	const onlyActionSteps = steps.filter( ( step ) => step.config.id !== 'all_done' );
	const checkIfAllStepsCompleted = onlyActionSteps.filter( isStepChecked ).length === onlyActionSteps.length;

	return (
		<List component="div" sx={ { py: 0 } }>
			{
				steps.map( ( step, index ) => {
					if ( ( step.config.id !== 'all_done' ) ) {
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
					} else if ( checkIfAllStepsCompleted ) {
						return (
							<SuccessMessage key={ index } step={ step } />
						);
					}
				} )
			};
		</List>
	);
};

export default ChecklistWrapper;

ChecklistWrapper.propTypes = {
	steps: PropTypes.array.isRequired,
	setSteps: PropTypes.func.isRequired,
};
