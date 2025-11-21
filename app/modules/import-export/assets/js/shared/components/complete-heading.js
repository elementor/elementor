import { Typography, Link, Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function CompleteHeading( {
	title,
	subtitle,
	linkText,
	linkHref,
	linkOnClick,
	testId = 'complete-heading',
} ) {
	return (
		<Box data-testid={ testId }>
			<Typography variant="h4" color="text.primary" component="h2" gutterBottom>
				{ title }
			</Typography>

			<Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
				{ subtitle }
				{ linkText && linkHref && (
					<>
						{ ' ' }
						<Link
							href={ linkHref }
							onClick={ linkOnClick }
							sx={ { cursor: 'pointer', textDecoration: 'underline' } }
							color="info.light"
						>
							{ linkText }
						</Link>
					</>
				) }
			</Typography>
		</Box>
	);
}

CompleteHeading.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string.isRequired,
	linkText: PropTypes.string,
	linkHref: PropTypes.string,
	linkOnClick: PropTypes.func,
	testId: PropTypes.string,
};
