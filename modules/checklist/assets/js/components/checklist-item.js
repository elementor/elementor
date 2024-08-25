import PropTypes from 'prop-types';
import ChecklistCardContent from './checklist-card-content';
import { ListItemButton, ListItemIcon, ListItemText, Collapse } from '@elementor/ui';
import { ChevronDownIcon, RadioButtonUncheckedIcon } from '@elementor/icons';

function CheckListItem( props ) {
	const { expandedIndex, setExpandedIndex, index, step } = props,
		chevronStyle = index === expandedIndex ? { transform: 'rotate(180deg)' } : {};

	const handleExpandClick = () => {
		setExpandedIndex( index === expandedIndex ? -1 : index );
	};

	return (
		<>
			<ListItemButton onClick={ handleExpandClick } className={ `e-checklist-item-button checklist-step-${ step.id }` }>
				<ListItemIcon> <RadioButtonUncheckedIcon /> </ListItemIcon>
				<ListItemText primary={ step.title } primaryTypographyProps={ { variant: 'body2' } } />
				<ChevronDownIcon sx={ { ...chevronStyle, transition: '300ms' } } />
			</ListItemButton>
			<Collapse in={ index === expandedIndex } >
				<ChecklistCardContent step={ step } />
			</Collapse>
		</>
	);
}

export default CheckListItem;

CheckListItem.propTypes = {
	step: PropTypes.object.isRequired,
	expandedIndex: PropTypes.number,
	setExpandedIndex: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};
