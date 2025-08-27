import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function SummarySection( { title, subTitle } ) {
	return (
		<Box>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				<Typography variant="body2" color="text.primary">
					{ title }
				</Typography>
			</Stack>
			<Typography variant="body2" color="text.tertiary">
				{ subTitle }
			</Typography>
		</Box>
	);
}

SummarySection.propTypes = {
	title: PropTypes.string.isRequired,
	subTitle: PropTypes.string.isRequired,
};
