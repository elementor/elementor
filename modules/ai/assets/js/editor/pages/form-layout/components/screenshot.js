import { Box, Skeleton } from '@elementor/ui';
import PropTypes from 'prop-types';
import ScreenshotContainer from './screenshot-container';
import ScreenshotUnavailable from './screenshot-unavailable';
import TemplateBadge from './template-badge';

const SCREENSHOT_HEIGHT = '138px';

const Screenshot = ( { url, type, isLoading = false, isSelected = false, isPlaceholder, disabled, onClick, sx = {}, outlineOffset } ) => {
	if ( isPlaceholder ) {
		return <Box sx={ { height: SCREENSHOT_HEIGHT, ...sx } } />;
	}

	if ( isLoading ) {
		return (
			<Skeleton
				width="100%"
				animation="wave"
				variant="rounded"
				height={ SCREENSHOT_HEIGHT }
				sx={ sx }
			/>
		);
	}

	if ( ! url ) {
		return (
			<ScreenshotUnavailable
				selected={ isSelected }
				disabled={ disabled }
				sx={ sx }
				onClick={ onClick }
				height={ SCREENSHOT_HEIGHT }
				outlineOffset={ outlineOffset }
			/>
		);
	}

	return (
		<ScreenshotContainer
			selected={ isSelected }
			disabled={ disabled }
			sx={ { backgroundImage: `url('${ url }')`, ...sx } }
			onClick={ onClick }
			height={ SCREENSHOT_HEIGHT }
			outlineOffset={ outlineOffset }
		>
			<TemplateBadge type={ type } />
		</ScreenshotContainer>

	);
};

Screenshot.propTypes = {
	isSelected: PropTypes.bool,
	isLoading: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	url: PropTypes.string,
	type: PropTypes.string,
	sx: PropTypes.object,
	outlineOffset: PropTypes.string,
};

export default Screenshot;
