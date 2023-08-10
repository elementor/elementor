import { memo } from 'react';
import { Box } from '@elementor/ui';
import SkeletonPlaceholders from './skeleton-placeholders';
import ScreenshotContainer from './screenshot-container';

const SCREENSHOT_HEIGHT = '138px';

const ScreenshotsDisplay = ( { screenshotsData, selectedIndex, onClick, isLoading, ...props } ) => (
	<Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, p: 5 } }>
		{
			isLoading ? (
				<SkeletonPlaceholders height={ SCREENSHOT_HEIGHT } />
			) : (
				<>
					{
						screenshotsData.map( ( { screenshot }, index ) => (
							<ScreenshotContainer
								key={ index }
								selected={ selectedIndex === index }
								sx={ { backgroundImage: `url('${ screenshot }')` } }
								onClick={ () => onClick( index ) }
								height={ SCREENSHOT_HEIGHT }
								{ ...props }
							/>
						) )
					}
				</>
			)
		}
	</Box>
);

ScreenshotsDisplay.propTypes = {
	isLoading: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	selectedIndex: PropTypes.number,
	screenshotsData: PropTypes.array,
};

export default memo( ScreenshotsDisplay );
