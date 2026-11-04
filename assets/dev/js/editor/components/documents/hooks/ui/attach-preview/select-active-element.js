import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

const ELEMENT_ID_PATTERN = /^[A-Za-z0-9]+$/;
const SELECT_AFTER_PREVIEW_READY = 1000;
const SCROLL_RETRY_DELAY = 400;
const MAX_SCROLL_ATTEMPTS = 8;
const IN_VIEW_TOLERANCE = 4;

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

		window.setTimeout( () => watchElementInView( container, 0 ), SELECT_AFTER_PREVIEW_READY );
	}
}

function watchElementInView( container, attempt ) {
	if ( 0 === attempt ) {
		$e.run( 'document/elements/select', { container } );
	}

	const inView = scrollContainerIntoView( container );
	const shouldCheckAgain = attempt < MAX_SCROLL_ATTEMPTS - 1 && ( 0 === attempt || ! inView );

	if ( shouldCheckAgain ) {
		window.setTimeout( () => watchElementInView( container, attempt + 1 ), SCROLL_RETRY_DELAY );
	}
}

function measureVisibleBox( elementNode ) {
	const ownRect = elementNode.getBoundingClientRect();

	if ( ownRect.height > 0 ) {
		return ownRect;
	}

	const descendants = elementNode.querySelectorAll?.( '*' ) ?? [];

	for ( const descendant of descendants ) {
		const rect = descendant.getBoundingClientRect();

		if ( rect.height > 0 ) {
			return rect;
		}
	}

	return ownRect;
}

function scrollContainerIntoView( container ) {
	const elementNode = container.view?.el || container.view?.$el?.[ 0 ];

	if ( ! elementNode?.isConnected ) {
		return false;
	}

	const previewWindow = elementNode.ownerDocument.defaultView;
	const scrollingElement = previewWindow.document.scrollingElement || previewWindow.document.documentElement;
	const rect = measureVisibleBox( elementNode );

	if ( rect.height <= 0 ) {
		return false;
	}

	const centeredTop = scrollingElement.scrollTop + rect.top - ( ( previewWindow.innerHeight - rect.height ) / 2 );

	scrollingElement.scrollTop = Math.max( 0, centeredTop );

	const placed = measureVisibleBox( elementNode );
	const expectedTop = ( previewWindow.innerHeight - placed.height ) / 2;

	return Math.abs( placed.top - expectedTop ) <= IN_VIEW_TOLERANCE;
}

export default SelectActiveElement;
