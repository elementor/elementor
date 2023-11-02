import { Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

export const PromptChips = ( props ) => {
	return (
		<Stack
			direction="row"
			spacing={ 1 }
			marginBottom={ 2 }
		>
			{ props.children }
		</Stack>
	);
};

PromptChips.propTypes = {
	children: PropTypes.node,
};
