import { toggleHistory } from './history';
import { generateIds } from './genereate-ids';

const PREVIEW_CONTAINER_ID = 'e-ai-preview-container';

/**
 * @param {{ at?: number }} options
 * @param {Object | null}   model
 *
 * @return {Object}
 */
export function createPreviewContainer( options = {}, model = null ) {
	toggleHistory( false );

	// When no model is supplied, create an empty Container. Used for UI purposes only.
	if ( ! model ) {
		model = {
			elType: 'container',
		};
	}

	const previewContainer = $e.run( 'document/elements/create', {
		container: elementor.getPreviewContainer(),
		model: {
			...model,
			id: PREVIEW_CONTAINER_ID,
		},
		options: {
			...options,
			edit: false,
		},
	} );

	toggleHistory( true );

	return previewContainer;
}

export function deletePreviewContainer() {
	toggleHistory( false );

	const container = getPreviewContainer();

	if ( container ) {
		$e.run( 'document/elements/delete', {
			container,
		} );
	}

	toggleHistory( true );
}

export function setPreviewContainerIdle() {
	const container = getPreviewContainer();

	if ( container ) {
		container.view.$el.addClass( 'e-ai-preview-container--idle' );
	}
}

export function setPreviewContainerLoading() {
	const container = getPreviewContainer();

	if ( container ) {
		container.view.$el.addClass( 'e-ai-preview-container--loading' );
	}
}

export function setPreviewContainerContent( template ) {
	if ( ! template ) {
		return;
	}

	const view = getPreviewContainer()?.view;

	if ( ! view ) {
		return;
	}

	const currentContainerPosition = view._index;

	deletePreviewContainer();

	/**
	 * Temp fix:
	 * Deleting the preview container is an async action, if we try to create a new preview container before the current is deleted,
	 * The new container will not be created due to targeting the same ID.
	 */
	setTimeout( () => {
		createPreviewContainer(
			{ at: currentContainerPosition },
			generateIds( template ),
		);
	}, 1000 );
}

function getPreviewContainer() {
	return elementor.getContainer( PREVIEW_CONTAINER_ID );
}
