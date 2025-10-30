import { Typography, Link } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function DownloadLink( {
	message,
	linkText,
	onClick,
	testId = 'download-link',
} ) {
	return (
		<Typography variant="body2" color="text.secondary" data-testid={ testId }>
			{ message }{ ' ' }
			<Link href="#" onClick={ onClick } color="info.light" sx={ { cursor: 'pointer', textDecoration: 'underline' } }>
				{ linkText }
			</Link>
			{ '. ' }
		</Typography>
	);
}

DownloadLink.propTypes = {
	message: PropTypes.string.isRequired,
	linkText: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	testId: PropTypes.string,
};
