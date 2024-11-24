export class AtomicWidgetView extends elementor.modules.elements.views.Widget {
	/**
	 * TODO: Explain why?
	 */
	behaviors() {
		const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

		const behaviorsAsEntries = Object.entries( super.behaviors() )
			.filter( ( [ key ] ) => ! disabledBehaviors.includes( key ) );

		return Object.fromEntries( behaviorsAsEntries );
	}

	/**
	 * TODO: Explain why?
	 */
	getDraggableElement() {
		return this.$el.find( ':first-child' );
	}

	/**
	 * TODO: Explain why?
	 */
	getHandlesOverlay() {
		return null;
	}

	/**
	 * TODO: Explain why?
	 */
	attributes() {
		return {
			...super.attributes(),
			style: 'display: contents !important;',
			'data-atomic': '',
		};
	}
}
