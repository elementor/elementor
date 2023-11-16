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
	elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
	elementorCommon.config.library_connect.current_access_tier = data.access_tier;
};

export const getUiConfig = () => {
	const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';
	const isRTL = elementorCommon.config.isRTL;

	return {
		colorScheme,
		isRTL,
	};
};

const VARIATIONS_PROMPTS = [
	{ text: __( 'Minimalist design with bold typography about', 'elementor' ) },
	{ text: __( 'Elegant style with serif fonts discussing', 'elementor' ) },
	{ text: __( 'Retro vibe with muted colors and classic fonts about', 'elementor' ) },
	{ text: __( 'Futuristic layout with neon accents around', 'elementor' ) },
	{ text: __( 'Professional look with clean lines for', 'elementor' ) },
	{ text: __( 'Earthy tones and organic shapes featuring', 'elementor' ) },
	{ text: __( 'Luxurious theme with rich colors discussing', 'elementor' ) },
	{ text: __( 'Tech-inspired style with modern fonts about', 'elementor' ) },
	{ text: __( 'Warm hues with comforting visuals about', 'elementor' ) },
];

export const renderLayoutApp = ( options = {
	mode: '',
	at: null,
	onClose: null,
	onGenerate: null,
	onInsert: null,
	onRenderApp: null,
	onSelect: null,
	attachments: [],
} ) => {
	closePanel();

	const previewContainer = createPreviewContainer( {
		// Create the container at the "drag widget here" area position.
		at: options.at,
	} );

	const { colorScheme, isRTL } = getUiConfig();

	const rootElement = document.createElement( 'div' );
	document.body.append( rootElement );

	ReactDOM.render(
		<LayoutApp
			mode={ options.mode }
			isRTL={ isRTL }
			colorScheme={ colorScheme }
			attachmentsTypes={ {
				json: {
					promptSuggestions: VARIATIONS_PROMPTS,
					previewGenerator: async ( json ) => {
						const screenshot = await takeScreenshot( json );
						return `<img src="${ screenshot }" />`;
					},
				},
				url: {
					promptSuggestions: VARIATIONS_PROMPTS,
				},
			} }
			attachments={ options.attachments || [] }
			onClose={ () => {
				previewContainer.destroy();
				options.onClose?.();

				ReactDOM.unmountComponentAtNode( rootElement );
				rootElement.remove();

				openPanel();
			} }
			onConnect={ onConnect }
			onGenerate={ () => {
				options.onGenerate?.( { previewContainer } );
			} }
			onData={ async ( template ) => {
				const screenshot = await takeScreenshot( template );

				return {
					screenshot,
					template,
				};
			} }
			onSelect={ ( template ) => {
				options.onSelect?.();
				previewContainer.setContent( template );
			} }
			onInsert={ options.onInsert }
		/>,
		rootElement,
	);

	options.onRenderApp?.( { previewContainer } );
};

export const importToEditor = ( {
	at,
	template,
	historyTitle,
	replace = false,
} ) => {
	const endHistoryLog = startHistoryLog( {
		type: 'import',
		title: historyTitle,
	} );

	if ( replace ) {
		$e.run( 'document/elements/delete', {
			container: elementor.getPreviewContainer().children.at( at ),
		} );
	}

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

