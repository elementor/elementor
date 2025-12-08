import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import HomeScreen from './components/home-screen/home-screen';
import EditorScreen from './components/editor-screen/home-screen';

const App = ( props ) => {
	const isEditorOneActive = props.homeScreenData?.isEditorOneActive || false;
	const ScreenComponent = isEditorOneActive ? EditorScreen : HomeScreen;

	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] ========================================' );
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] JS: isEditorOneActive:', isEditorOneActive );
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] JS: Selected component:', isEditorOneActive ? 'EditorScreen' : 'HomeScreen' );
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] JS: props.homeScreenData.isEditorOneActive:', props.homeScreenData?.isEditorOneActive );
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] JS: props.homeScreenData._debug:', props.homeScreenData?._debug );
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData global exists:', typeof elementorHomeScreenData !== 'undefined' );
	if ( typeof elementorHomeScreenData !== 'undefined' ) {
		// eslint-disable-next-line no-console
		console.log( '[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData.isEditorOneActive:', elementorHomeScreenData?.isEditorOneActive );
		// eslint-disable-next-line no-console
		console.log( '[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData._debug:', elementorHomeScreenData?._debug );
	}
	// eslint-disable-next-line no-console
	console.log( '[HOME_SCREEN_DEBUG] ========================================' );

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<ScreenComponent
						homeScreenData={ props.homeScreenData }
						adminUrl={ props.adminUrl }
						isEditorOneActive={ isEditorOneActive }
					/>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	adminUrl = elementorAppConfig.admin_url,
	rootElement = document.querySelector( '#e-home-screen' );

App.propTypes = {
	isRTL: PropTypes.bool,
	adminUrl: PropTypes.string,
	homeScreenData: PropTypes.object,
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
		homeScreenData={ elementorHomeScreenData }
		adminUrl={ adminUrl }
	/>
), rootElement );
