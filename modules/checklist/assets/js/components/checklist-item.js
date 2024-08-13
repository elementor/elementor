import { useState } from 'react';
import PropTypes from 'prop-types';
import ChecklistCardContent from './checklist-card-content';
import { ListItemButton, ListItemIcon, ListItemText, Collapse } from '@elementor/ui';
import { ChevronDownIcon, RadioButtonUncheckedIcon } from '@elementor/icons';

function CheckListItem( props ) {
	const { expandedIndex, setExpandedIndex, index, step } = props,
		[ expanded, setExpanded ] = useState( false );

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItemButton onClick={ () => {
				setExpandedIndex( index );
				handleExpandClick();
			} } >
				<ListItemIcon> <RadioButtonUncheckedIcon /> </ListItemIcon>
				<ListItemText id={ step.title } primary={ step.title } primaryTypographyProps={ { variant: 'body2' } } />
				{ index === expandedIndex && expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)' } } /> : <ChevronDownIcon /> }
			</ListItemButton>
			<Collapse in={ index === expandedIndex && expanded } >
				<ChecklistCardContent step={ step } />
			</Collapse>
		</>
	);
}

export default CheckListItem;

CheckListItem.propTypes = {
	step: PropTypes.object.isRequired,
	expandedIndex: PropTypes.oneOfType( [
		PropTypes.number,
		PropTypes.oneOf( [ null ] ),
	] ),
	setExpandedIndex: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};
