import { Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function CompleteIcon( { imageSrc, altText, width = '200px', marginBottom = 2, testId = 'complete-icon' } ) {
	return (
		<Box sx={ { mb: marginBottom } } data-testid={ testId }>
			<img
				src={ imageSrc }
				alt={ altText }
				style={ { width } }
			/>
		</Box>
	);
}

CompleteIcon.propTypes = {
	imageSrc: PropTypes.string.isRequired,
	altText: PropTypes.string.isRequired,
	width: PropTypes.string,
	marginBottom: PropTypes.number,
	testId: PropTypes.string,
};
