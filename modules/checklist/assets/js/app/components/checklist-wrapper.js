import { useState, Fragment } from 'react';
import { Box, List, Divider } from '@elementor/ui';
import CheckListItem from './checklist-item';
import PropTypes from 'prop-types';
import SuccessMessage from './success-message';
import { isStepChecked } from '../../utils/functions';

const ChecklistWrapper = ( { steps, setSteps, isMinimized } ) => {
	const [ expandedIndex, setExpandedIndex ] = useState( -1 );
	const isChecklistCompleted = steps.filter( isStepChecked ).length === steps.length;

	return (
		<Box sx={ {
			transition: '400ms',
			maxHeight: isMinimized ? 0 : '645px',
		} }>
			<List component="div" sx={ { py: 0 } }>
				{
					steps.map( ( step, index ) => {
						return (
							<Fragment key={ index }>
								{ ( index ) ? <Divider /> : null }
								<CheckListItem
									step={ step }
									setSteps={ setSteps }
									setExpandedIndex={ setExpandedIndex }
									expandedIndex={ expandedIndex }
									index={ index }
								/>
							</Fragment>
						);
					} )
				}
			</List>
			{ isChecklistCompleted ? <SuccessMessage /> : null }
		</Box>
	);
};

export default ChecklistWrapper;

ChecklistWrapper.propTypes = {
	steps: PropTypes.array.isRequired,
	setSteps: PropTypes.func.isRequired,
	isMinimized: PropTypes.bool.isRequired,
};
