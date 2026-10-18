import { createEditorPreviewRenderer } from './data-flow-editor-preview-renderer';
import { parseStaticState } from './data-flow-editor-state';
import { createSnippetRegistry } from './data-flow-snippet-registry';

const STATIC_STATE_SETTING = 'e_data_flow_static_state';
const COMPONENT_WIDGET_TYPE = 'e-component';
const COMMAND_RUN_AFTER = 'run:after';

function getComponentId( container ) {
	return container.settings?.get( 'component_instance' )?.value?.component_id?.value ?? null;
}

function createElementEntryGetter( editor ) {
	return ( id ) => {
		const container = editor.getContainer?.( id );

		if ( ! container ) {
			return {};
		}

		const state = container.model.get( 'state' ) ?? {};

		if ( COMPONENT_WIDGET_TYPE === container.model.get( 'widgetType' ) ) {
			const componentParams = editor.config?.dataFlow?.componentParams?.[ getComponentId( container ) ] ?? [];

			return { componentParams, state };
		}

		return { stateParams: container.model.get( 'state_params' ) ?? [] };
	};
}

function createSnippetLoader( editor ) {
	const loaded = new Set();

	return ( name ) => {
		const url = editor.config?.dataFlow?.snippetFiles?.[ name ];

		if ( ! url || loaded.has( name ) ) {
			return;
		}

		loaded.add( name );

		const script = document.createElement( 'script' );

		script.src = url;
		document.head.appendChild( script );
	};
}

function createSnippetEntriesGetter( editor ) {
	return () => {
		const entries = [];

		document.querySelectorAll( '[data-id]' ).forEach( ( element ) => {
			const snippets = editor.getContainer?.( element.dataset.id )?.model?.get( 'snippets' ) ?? [];

			if ( snippets.length ) {
				entries.push( { elementId: element.dataset.id, snippets } );
			}
		} );

		return entries;
	};
}

function init() {
	const editor = window.parent?.elementor;
	const commands = window.parent?.$e?.commands;

	if ( ! editor || ! commands ) {
		return;
	}

	const registry = createSnippetRegistry();

	window.elementorDataFlow = { registerSnippet: registry.registerSnippet };

	const renderer = createEditorPreviewRenderer( {
		root: document.body,
		getElementEntry: createElementEntryGetter( editor ),
		registry,
		loadSnippet: createSnippetLoader( editor ),
		getSnippetEntries: createSnippetEntriesGetter( editor ),
		getPageState: () => parseStaticState( editor.documents?.getCurrent()?.container?.settings?.get( STATIC_STATE_SETTING ) ),
	} );

	commands.on( COMMAND_RUN_AFTER, renderer.schedule );

	window.addEventListener( 'pagehide', () => {
		commands.off( COMMAND_RUN_AFTER, renderer.schedule );
		renderer.destroy();
	} );

	renderer.schedule();
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
