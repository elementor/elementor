import { isContainerElement } from '../document/elements/utils/is-inner';

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
