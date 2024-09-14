import PropTypes from 'prop-types';
import ChecklistCardContent from './checklist-card-content';
import { ListItemButton, ListItemIcon, ListItemText, Collapse, Checkbox, SvgIcon } from '@elementor/ui';
import { CircleCheckFilledIcon, ChevronDownIcon, RadioButtonUncheckedIcon, UpgradeIcon } from '@elementor/icons';
import { isStepChecked } from '../../utils/functions';
import { STEP } from '../../utils/consts';

const { PROMOTION_DATA } = STEP;

function CheckListItem( props ) {
	const { expandedIndex, setExpandedIndex, setSteps, index, step } = props,
		chevronStyle = index === expandedIndex ? { transform: 'rotate(180deg)' } : {},
		isChecked = isStepChecked( step ),
		promotionData = step.config[ PROMOTION_DATA ];

	const handleExpandClick = () => {
		setExpandedIndex( index === expandedIndex ? -1 : index );
	};

	const getUpgradeIcon = () => {
		return 'default' === promotionData?.icon
			? <UpgradeIcon color="promotion" sx={ { mr: 1 } } />
			: <SvgIcon color="promotion" sx={ { mr: 1 } }>
				<img src={ promotionData?.icon } alt={ promotionData.iconAlt || '' } />
			</SvgIcon>;
	};

	return (
		<>
			<ListItemButton onClick={ handleExpandClick } data-step-id={ step.config.id }>
				<ListItemIcon>
					<Checkbox
						data-is-checked={ isChecked }
						icon={ <RadioButtonUncheckedIcon /> }
						checkedIcon={ <CircleCheckFilledIcon color="primary" /> }
						edge="start"
						checked={ isChecked }
						tabIndex={ -1 }
						inputProps={ { 'aria-labelledby': step.config.title } }
					/>
				</ListItemIcon>
				<ListItemText primary={ step.config.title } primaryTypographyProps={ { variant: 'body2' } } />
				{ promotionData ? getUpgradeIcon() : null }
				<ChevronDownIcon sx={ { ...chevronStyle, transition: '300ms' } } />
			</ListItemButton>
			<Collapse in={ index === expandedIndex } >
				<ChecklistCardContent step={ step } setSteps={ setSteps } />
			</Collapse>
		</>
	);
}

export default CheckListItem;

CheckListItem.propTypes = {
	step: PropTypes.object.isRequired,
	expandedIndex: PropTypes.number,
	setExpandedIndex: PropTypes.func.isRequired,
	setSteps: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};
