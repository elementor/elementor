export class AtomicWidgetView extends elementor.modules.elements.views.Widget {
	// Dispatch `render` event so the overlay layer will be updated
	onRender( ...args ) {
		super.onRender( ...args );

		this.#dispatchEvent( 'elementor/preview/atomic-widget/render' );
	}

	// Dispatch `destroy` event so the overlay layer will be updated
	onDestroy( ...args ) {
		super.onDestroy( ...args );

		this.#dispatchEvent( 'elementor/preview/atomic-widget/destroy' );
	}

	// Removes behaviors that are not needed for atomic widgets (that are implemented in the overlay layer).
	behaviors() {
		const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

		const behaviorsAsEntries = Object.entries( super.behaviors() )
			.filter( ( [ key ] ) => ! disabledBehaviors.includes( key ) );

		return Object.fromEntries( behaviorsAsEntries );
	}

	// Change the drag handle because the $el is not the draggable element (`display: contents`).
	getDraggableElement() {
		return this.$el.find( ':first-child' );
	}

	// Remove the overlay, so we can use the new overlay layer.
	getHandlesOverlay() {
		return null;
	}

	attributes() {
		return {
			...super.attributes(),

			// Mark the widget as atomic, so the overlay layer can identify it.
			'data-atomic': '',

			// Make the wrapper non-existent in terms of CSS to mimic the frontend DOM tree.
			style: 'display: contents !important;',
		};
	}

	#dispatchEvent( type ) {
		window.top.dispatchEvent( new CustomEvent( type, { detail: { id: this.model.get( 'id' ) } } ) );
	}
}
