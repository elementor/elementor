import { Skeleton } from '@elementor/ui';
import ScreenshotContainer from './screenshot-container';

const SCREENSHOT_HEIGHT = '138px';

const Screenshot = ( { url, isSelected = false, disabled, onClick } ) => {
	if ( ! url ) {
		return (
			<Skeleton
				width="100%"
				animation="wave"
				variant="rounded"
				height={ SCREENSHOT_HEIGHT }
				sx={ { borderRadius: ( { border } ) => border.size.md } }
			/>
		);
	}

	return (
		<ScreenshotContainer
			selected={ isSelected }
			disabled={ disabled }
			sx={ { backgroundImage: `url('${ url }')` } }
			onClick={ onClick }
			height={ SCREENSHOT_HEIGHT }
		/>
	);
};

Screenshot.propTypes = {
	isSelected: PropTypes.bool,
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	url: PropTypes.string,
};

export default Screenshot;
