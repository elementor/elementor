import PropTypes from 'prop-types';
import ChecklistCardContent from './checklist-card-content';
import { ListItemButton, ListItemIcon, ListItemText, Collapse } from '@elementor/ui';
import { CheckedCircleIcon, ChevronDownIcon, RadioButtonUncheckedIcon, UpgradeIcon } from '@elementor/icons';

function CheckListItem( props ) {
	const { expandedIndex, setExpandedIndex, index, step } = props,
		chevronStyle = index === expandedIndex ? { transform: 'rotate(180deg)' } : {};

	const handleExpandClick = () => {
		setExpandedIndex( index === expandedIndex ? -1 : index );
	};

	return (
		<>
			<ListItemButton onClick={ handleExpandClick } className={ `e-checklist-item-button checklist-step-${ step.config.id }` }>
				<ListItemIcon>{ step.is_completed ? <CheckedCircleIcon /> : <RadioButtonUncheckedIcon />
				}</ListItemIcon>
				<ListItemText primary={ step.config.title } primaryTypographyProps={ { variant: 'body2' } } />
				{ step.config.is_locked ? <UpgradeIcon color="promotion" sx={ { mr: 1 } } /> : null }
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
