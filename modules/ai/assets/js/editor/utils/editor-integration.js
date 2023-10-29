import { createPreviewContainer } from './preview-container';
import LayoutApp from '../layout-app';
import { takeScreenshot } from './screenshot';
import { startHistoryLog } from './history';
import { __ } from '@wordpress/i18n';
import { generateIds } from './genereate-ids';

export const closePanel = () => {
	$e.run( 'panel/close' );
	$e.components.get( 'panel' ).blockUserInteractions();
};

export const openPanel = () => {
	$e.run( 'panel/open' );
	$e.components.get( 'panel' ).unblockUserInteractions();
};

export const onConnect = ( data ) => {
	elementorCommon.config.library_connect.is_connected = true;
	elementorCommon.config.library_connect.current_access_level = data.accessLevel;
};

export const getUiConfig = () => {
	const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
	const isRTL = elementorCommon.config.isRTL;
	const locale = elementorCommon.config.locale;

	return {
		colorScheme,
		isRTL,
		locale,
	};
};

export const renderLayoutApp = ( options = {
	at: null,
	onInsert: null,
} ) => {
	closePanel();

	const previewContainer = createPreviewContainer( {
		at: options.at,
	} );

	previewContainer.init();

	const { colorScheme, isRTL, locale } = getUiConfig();

	const rootElement = document.createElement( 'div' );
	document.body.append( rootElement );

	ReactDOM.render(
		<LayoutApp
			isRTL={ isRTL }
			colorScheme={ colorScheme }
			locale={ locale }
			onClose={ () => {
				previewContainer.destroy();

				ReactDOM.unmountComponentAtNode( rootElement );
				rootElement.remove();

				openPanel();
			} }
			onConnect={ onConnect }
			onGenerate={ () => previewContainer.reset() }
			onData={ async ( template ) => {
				const screenshot = await takeScreenshot( template );

				return {
					screenshot,
					template,
				};
			} }
			onSelect={ ( template ) => previewContainer.setContent( template ) }
			onInsert={ options.onInsert }
		/>,
		rootElement,
	);
};

export const importToEditor = ( {
	at,
	template,
	historyTitle,
} ) => {
	const endHistoryLog = startHistoryLog( {
		type: 'import',
		title: historyTitle,
	} );

	$e.run( 'document/elements/create', {
		container: elementor.getPreviewContainer(),
		model: generateIds( template ),
		options: {
			at,
			edit: true,
		},
	} );

	endHistoryLog();
};
