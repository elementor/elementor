import ReactUtils from 'elementor-utils/react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';
import HomeScreen from './components/home-screen/home-screen';
import EditorScreen from './components/editor-screen/home-screen';

const App = ( props ) => {
	const isEditorOneActive = props.homeScreenData?.isEditorOneActive || false;
	const ScreenComponent = isEditorOneActive ? EditorScreen : HomeScreen;

	const debugInfo = {
		isEditorOneActive,
		selectedComponent: isEditorOneActive ? 'EditorScreen' : 'HomeScreen',
		propsIsEditorOneActive: props.homeScreenData?.isEditorOneActive,
		propsDebug: props.homeScreenData?._debug,
		globalExists: typeof elementorHomeScreenData !== 'undefined',
		globalIsEditorOneActive: typeof elementorHomeScreenData !== 'undefined' ? elementorHomeScreenData?.isEditorOneActive : 'N/A',
		globalDebug: typeof elementorHomeScreenData !== 'undefined' ? elementorHomeScreenData?._debug : 'N/A',
	};

	const debugMessages = [
		'[HOME_SCREEN_DEBUG] ========================================',
		`[HOME_SCREEN_DEBUG] JS: isEditorOneActive: ${ isEditorOneActive }`,
		`[HOME_SCREEN_DEBUG] JS: Selected component: ${ debugInfo.selectedComponent }`,
		`[HOME_SCREEN_DEBUG] JS: props.homeScreenData.isEditorOneActive: ${ debugInfo.propsIsEditorOneActive }`,
		`[HOME_SCREEN_DEBUG] JS: props.homeScreenData._debug: ${ JSON.stringify( debugInfo.propsDebug ) }`,
		`[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData global exists: ${ debugInfo.globalExists }`,
		`[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData.isEditorOneActive: ${ debugInfo.globalIsEditorOneActive }`,
		`[HOME_SCREEN_DEBUG] JS: elementorHomeScreenData._debug: ${ JSON.stringify( debugInfo.globalDebug ) }`,
		'[HOME_SCREEN_DEBUG] ========================================',
	];

	debugMessages.forEach( ( msg ) => {
		// eslint-disable-next-line no-console
		console.log( msg );
	} );

	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<div
						id="home-screen-debug-info"
						style={ {
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							background: '#000',
							color: '#0f0',
							padding: '10px',
							fontFamily: 'monospace',
							fontSize: '12px',
							zIndex: 99999,
							maxHeight: '200px',
							overflow: 'auto',
							borderBottom: '2px solid #0f0',
						} }
					>
						<div style={ { fontWeight: 'bold', marginBottom: '5px' } }>HOME SCREEN DEBUG INFO</div>
						<div>isEditorOneActive: { String( isEditorOneActive ) }</div>
						<div>Selected Component: { debugInfo.selectedComponent }</div>
						<div>props.homeScreenData.isEditorOneActive: { String( debugInfo.propsIsEditorOneActive ) }</div>
						<div>props._debug: { JSON.stringify( debugInfo.propsDebug ) }</div>
						<div>Global exists: { String( debugInfo.globalExists ) }</div>
						<div>Global isEditorOneActive: { String( debugInfo.globalIsEditorOneActive ) }</div>
						<div>Global _debug: { JSON.stringify( debugInfo.globalDebug ) }</div>
					</div>
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
