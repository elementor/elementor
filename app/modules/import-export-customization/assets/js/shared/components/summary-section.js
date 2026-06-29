import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function SummarySection( { title, subTitle, sectionKey } ) {
	return (
		<Box data-testid={ `summary_section_${ sectionKey }` }>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				<Typography variant="body2" color="text.primary">
					{ title }
				</Typography>
			</Stack>
			<Typography variant="body2" color="text.tertiary" data-testid={ `summary_section_${ sectionKey }_subtitle` }>
				{ subTitle }
			</Typography>
		</Box>
	);
}

SummarySection.propTypes = {
	title: PropTypes.string.isRequired,
	subTitle: PropTypes.string.isRequired,
	sectionKey: PropTypes.string.isRequired,
};
