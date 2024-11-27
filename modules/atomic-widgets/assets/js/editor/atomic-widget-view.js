export class AtomicWidgetView extends elementor.modules.elements.views.Widget {
	// Dispatch `render` event for so the overlay layer can be updated
	onRender( ...args ) {
		super.onRender( ...args );

		this._dispatchEvent( 'elementor/preview/atomic-widget/render' );
	}

	// Dispatch `destroy` event for so the overlay layer can be updated
	onDestroy( ...args ) {
		super.onDestroy( ...args );

		this._dispatchEvent( 'elementor/preview/atomic-widget/destroy' );
	}

	// Removes behaviors that are not needed for atomic widgets (Should be reimplemented in the overlay layer).
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

	// Set the `data-atomic` attribute to the widget element + `display: contents;`.
	// The css will behave like the wrapper `div` is not exists and with that we can remove this `div` in the frontend.
	attributes() {
		return {
			...super.attributes(),
			style: 'display: contents !important;',
			'data-atomic': '',
		};
	}

	_dispatchEvent( type ) {
		window.top.dispatchEvent( new CustomEvent( type, { detail: { id: this.model.get( 'id' ) } } ) );
	}
}
