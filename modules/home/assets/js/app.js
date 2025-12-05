import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import HomeScreen from './components/home-screen/home-screen';
import EditorScreen from './components/editor-screen/home-screen';

const App = ( props ) => {
	const ScreenComponent = props.isEditorOneActive ? EditorScreen : HomeScreen;

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<ScreenComponent
						homeScreenData={ props.homeScreenData }
						adminUrl={ props.adminUrl }
					/>
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

const isRTL = elementorCommon.config.isRTL,
	adminUrl = elementorAppConfig.admin_url,
	rootElement = document.querySelector( '#e-home-screen' ),
	isEditorOneActive = elementorCommon?.config?.experimentalFeatures?.e_editor_one;

App.propTypes = {
	isRTL: PropTypes.bool,
	adminUrl: PropTypes.string,
	homeScreenData: PropTypes.object,
	isEditorOneActive: PropTypes.bool,
};

ReactUtils.render( (
	<App
		isRTL={ isRTL }
		homeScreenData={ elementorHomeScreenData }
		adminUrl={ adminUrl }
		isEditorOneActive={ isEditorOneActive }
	/>
), rootElement );
