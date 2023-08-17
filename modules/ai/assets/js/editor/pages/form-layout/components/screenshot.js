import { Box, Skeleton } from '@elementor/ui';
import ScreenshotContainer from './screenshot-container';

const SCREENSHOT_HEIGHT = '138px';

const Screenshot = ( { url, isSelected = false, isPlaceholder, disabled, onClick, sx = {}, outlineOffset } ) => {
	if ( isPlaceholder ) {
		return <Box sx={ { height: SCREENSHOT_HEIGHT, ...sx } } />;
	}

	if ( ! url ) {
		return (
			<Skeleton
				width="100%"
				animation="wave"
				variant="rounded"
				height={ SCREENSHOT_HEIGHT }
				sx={ { borderRadius: ( { border } ) => border.size.md, ...sx } }
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
		/>
	);
};

Screenshot.propTypes = {
	isSelected: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	url: PropTypes.string,
	sx: PropTypes.object,
	outlineOffset: PropTypes.string,
};

export default Screenshot;
