import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const PromptChips = ( props ) => {
	return (
		<Stack
			direction="row"
			spacing={ 1 }
			marginBottom={ 2 }
		>
			<Typography variant="caption">
				{ __( 'Prompt should affect:', 'elementor' ) }
			</Typography>
			{ props.children }
		</Stack>
	);
};

PromptChips.propTypes = {
	children: PropTypes.node,
};
