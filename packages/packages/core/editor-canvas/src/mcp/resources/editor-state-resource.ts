import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

const CURRENTLY_VIEWED_SCREEN = 'The user is currently viewing the Elementor editor';
const PAGE_CONTENT_CHARACTER_LIMIT = 500;
const PREVIEW_TEXT_NODE_MIN_LENGTH = 2;

export const EDITOR_STATE_URI = 'elementor://context/editor-state';

type ElementorWindow = Window & {
	elementor?: {
		$previewContents?: Element[];
		documents?: {
			getCurrent?: () => {
				config?: {
					settings?: {
						post_title?: string;
					};
				};
			};
		};
	};
};

export const initEditorStateResource = ( reg: MCPRegistryEntry ) => {
	const { resource, sendResourceUpdated } = reg;

	let lastSerializedState = '';

	const buildState = () => ( {
		currentlyViewedScreen: CURRENTLY_VIEWED_SCREEN,
		pageContent: getPageContentFromPreview(),
		pageTitle: getPageTitle(),
	} );

	const notifyIfChanged = () => {
		const serialized = JSON.stringify( buildState() );
		if ( serialized === lastSerializedState ) {
			return;
		}
		lastSerializedState = serialized;
		sendResourceUpdated( { uri: EDITOR_STATE_URI } );
	};

	listenTo(
		[ commandEndEvent( 'editor/documents/switch' ), commandEndEvent( 'editor/documents/attach-preview' ) ],
		notifyIfChanged
	);

	lastSerializedState = JSON.stringify( buildState() );

	resource(
		'editor-state',
		EDITOR_STATE_URI,
		{
			description: 'Editor page title, preview text snapshot, and viewed screen label.',
		},
		async () => {
			return {
				contents: [
					{
						uri: EDITOR_STATE_URI,
						text: JSON.stringify( buildState(), null, 2 ),
					},
				],
			};
		}
	);
};

function getPageContentFromPreview(): string | null {
	try {
		const root = ( window as ElementorWindow ).elementor?.$previewContents?.[ 0 ];
		if ( ! root ) {
			return null;
		}
		const content: string[] = [];
		const clone = root.cloneNode( true ) as HTMLElement;
		clone.querySelectorAll( '.elementor-editor-element-settings, #elementor-add-new-section' ).forEach( ( el ) => {
			el.remove();
		} );
		const walk = ( node: Node, insideElementorElement = false ) => {
			const isInside = ( node as Element ).classList?.contains( 'elementor-element' ) || insideElementorElement;
			if ( node.nodeType === Node.TEXT_NODE && isInside ) {
				const text = node.textContent?.trim().replace( /\s+/g, ' ' );
				if ( text && text.length > PREVIEW_TEXT_NODE_MIN_LENGTH ) {
					content.push( text );
				}
			} else {
				node.childNodes.forEach( ( child ) => {
					walk( child, isInside );
				} );
			}
		};
		walk( clone );
		const text = content.join( ' ' );
		if ( text.length > PAGE_CONTENT_CHARACTER_LIMIT ) {
			return text.slice( 0, PAGE_CONTENT_CHARACTER_LIMIT ) + '...';
		}
		return text;
	} catch {
		return null;
	}
}

function getPageTitle(): string {
	try {
		const extendedWindow = window as ElementorWindow;
		const currentDocument = extendedWindow.elementor?.documents?.getCurrent?.();
		const postTitle = currentDocument?.config?.settings?.post_title;
		if ( postTitle ) {
			return postTitle;
		}

		let title = document.title || 'Page';
		title = title.split( /\s*[‹»|–—-]\s*/ )[ 0 ];
		const trimmed = title.trim();
		return trimmed || 'Page';
	} catch {
		return 'Page';
	}
}
