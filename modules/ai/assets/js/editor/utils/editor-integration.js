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

	return {
		colorScheme,
		isRTL,
	};
};

export const createScreenshot = async ( template ) => {
	const screenshot = await takeScreenshot( template );

	return {
		screenshot,
		template,
	};
};

export const renderLayoutApp = ( options = {
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

	options.onRenderApp?.( { previewContainer } );

	const { colorScheme, isRTL } = getUiConfig();

	const rootElement = document.createElement( 'div' );
	document.body.append( rootElement );

	ReactDOM.render(
		<LayoutApp
			isRTL={ isRTL }
			colorScheme={ colorScheme }
			attachmentsTypes={ {
				json: {
					promptSuggestions: [
						{ text: 'Change the content to be about' },
						{ text: 'I need the container to become more related to' },
						{ text: 'Make the text more hard-sell oriented' },
						{ text: 'Alter the look and feel to become more Christmas related' },
						{ text: 'Replace all images to relate to' },
					],
					previewGenerator: async ( json ) => {
						const screenshot = await takeScreenshot( json );
						return `<img src="${ screenshot }" />`;
					},
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

export const registerContextMenu = ( groups, currentElement ) => {
	const saveGroup = groups.find( ( group ) => 'save' === group.name );

	if ( ! saveGroup ) {
		return groups;
	}

	// Add on top of save group actions
	saveGroup.actions.unshift( {
		name: 'ai',
		icon: 'eicon-ai',
		title: __( 'Generate AI Variations', 'elementor' ),
		callback: async () => {
			const container = currentElement.getContainer();
			const json = container.model.toJSON( { remove: [ 'default' ] } );
			const attachments = [ {
				type: 'json',
				previewHTML: '',
				content: json,
				label: container.model.get( 'title' ),
			} ];

			renderLayoutApp( {
				at: container.view._index,
				attachments,
				onSelect: () => {
					container.view.$el.hide();
				},
				onClose: () => {
					container.view.$el.show();
				},
				onInsert: ( template ) => {
					importToEditor( {
						at: container.view._index,
						template,
						historyTitle: __( 'AI Variation', 'elementor' ),
						replace: true,
					} );
				},
			} );
		},
	} );

	return groups;
};

