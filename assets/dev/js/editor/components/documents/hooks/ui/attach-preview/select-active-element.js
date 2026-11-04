import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

const ELEMENT_ID_PATTERN = /^[A-Za-z0-9]+$/;
const SELECT_AFTER_PREVIEW_READY = 1000;
const SCROLL_AFTER_PANEL_RESIZE = 1600;

export class SelectActiveElement extends $e.modules.hookUI.After {
	static calledOnce = false;

	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'select-active-element';
	}

	getConditions() {
		if ( this.constructor.calledOnce ) {
			return false;
		}

		return !! getQueryParam( 'active-element' );
	}

	apply() {
		const activeDocumentId = parseInt( getQueryParam( 'active-document' ) ),
			currentDocumentId = parseInt( elementor.documents.getCurrentId() );

		// The element lives in the document `active-document` is about to open.
		if ( ! isNaN( activeDocumentId ) && activeDocumentId !== currentDocumentId ) {
			return;
		}

		this.constructor.calledOnce = true;

		const activeElementId = getQueryParam( 'active-element' );

		if ( ! activeElementId || ! ELEMENT_ID_PATTERN.test( activeElementId ) ) {
			removeQueryParam( 'active-element' );
			return;
		}

		const container = elementor.getContainer( activeElementId );

		if ( ! container?.view?.el && ! container?.view?.$el?.[ 0 ] ) {
			removeQueryParam( 'active-element' );
			return;
		}

		// The preview iframe drops its scroll position while the panel width transition finishes.
		window.setTimeout( () => {
			$e.run( 'document/elements/select', { container } );
			scrollContainerIntoView( container );
		}, SELECT_AFTER_PREVIEW_READY );

		window.setTimeout( () => scrollContainerIntoView( container ), SCROLL_AFTER_PANEL_RESIZE );
	}
}

function getVisibleScrollTarget( elementNode ) {
	if ( elementNode.getBoundingClientRect().height > 0 ) {
		return elementNode;
	}

	const descendants = elementNode.querySelectorAll?.( '*' ) ?? [];

	for ( const descendant of descendants ) {
		if ( descendant.getBoundingClientRect().height > 0 ) {
			return descendant;
		}
	}

	return elementNode;
}

function scrollContainerIntoView( container ) {
	const elementNode = container.view?.el || container.view?.$el?.[ 0 ];

	if ( ! elementNode?.isConnected ) {
		return;
	}

	const previewWindow = elementNode.ownerDocument.defaultView;
	const scrollingElement = previewWindow.document.scrollingElement || previewWindow.document.documentElement;
	const rect = getVisibleScrollTarget( elementNode ).getBoundingClientRect();
	const centeredTop = scrollingElement.scrollTop + rect.top - ( ( previewWindow.innerHeight - rect.height ) / 2 );

	scrollingElement.scrollTop = Math.max( 0, centeredTop );
}

export default SelectActiveElement;
