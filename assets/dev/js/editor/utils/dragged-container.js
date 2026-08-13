import { isContainerElement } from '../document/elements/utils/is-inner';

const DOCUMENT_ELEMENT_TYPE = 'document';

/**
 * The view of the container currently being dragged on the canvas, if any.
 *
 * A missing `dataset.id` means the drag originated from the panel rather than
 * from an element that already exists in the document.
 *
 * @return {Backbone.View|null} The dragged container view.
 */
export const getDraggedContainerView = () => {
	const draggedView = elementor.channels.editor.request( 'element:dragged' );

	return draggedView?.el?.dataset?.id && isContainerElement( draggedView.model )
		? draggedView
		: null;
};

/**
 * Whether the container is nested inside another container rather than sitting
 * directly under the document. Only nested containers can be moved out to the
 * document level; a top-level container has nothing to un-nest.
 *
 * @param {Backbone.View} containerView The container view to test.
 *
 * @return {boolean} True when the container has a container ancestor.
 */
export const isNestedContainer = ( containerView ) => {
	return DOCUMENT_ELEMENT_TYPE !== containerView.getContainer().parent?.type;
};
