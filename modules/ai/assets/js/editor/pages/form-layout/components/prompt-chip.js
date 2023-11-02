import { Chip } from '@elementor/ui';
import PropTypes from 'prop-types';
import CheckIcon from '../../../icons/check-icon';

export const PromptChip = ( props ) => {
	return (
		<Chip
			variant="outlined"
			sx={ {
				color: props.isSelected ? '#C00BB9' : 'grey.900',
				borderColor: props.isSelected ? '#C00BB9' : 'grey.200',
			} }
			label={ props.label }
			icon={ props.isSelected ? <CheckIcon /> : <></> }
			onClick={ props.onClick }
		/>
	);
};

PromptChip.propTypes = {
	label: PropTypes.string,
	isSelected: PropTypes.bool,
	onClick: PropTypes.func,
};
