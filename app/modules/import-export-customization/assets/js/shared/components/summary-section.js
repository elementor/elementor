import { Box, Typography, Stack } from '@elementor/ui';
import PropTypes from 'prop-types';

const ExternalLinkIcon = () => (
	<Box
		component="i"
		sx={ { fontFamily: 'eicons' } }
		className="eps-icon eicon-editor-external-link"
	/>
);

export default function SummarySection( { title, subTitle } ) {
	return (
		<Box>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				<Typography variant="body2" color="text.primary">
					{ title }
				</Typography>
				<ExternalLinkIcon />
			</Stack>
			<Typography variant="caption" color="text.secondary">
				{ subTitle }
			</Typography>
		</Box>
	);
}

SummarySection.propTypes = {
	title: PropTypes.string.isRequired,
	subTitle: PropTypes.string.isRequired,
};
