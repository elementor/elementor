import { type ElementType, type ElementView, type LegacyWindow } from './types';

// Technically it shouldn't have a return type annotation, but for some
// reason TypeScript can't infer the types properly when emitting DTS.
//
// See: https://github.com/microsoft/TypeScript/issues/9944#issuecomment-244448079
export function createElementType( type: string ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createElementViewClassDeclaration();
		}
	};
}

export function createElementViewClassDeclaration(): typeof ElementView {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.views.Widget {
		// Dispatch `render` event so the overlay layer will be updated
		onRender( ...args: unknown[] ) {
			super.onRender( ...args );

			this.#dispatchEvent( 'elementor/preview/atomic-widget/render' );
			this.#dispatchPreviewEvent( 'elementor/element/render' );
		}

		// Dispatch `destroy` event so the overlay layer will be updated
		onDestroy( ...args: unknown[] ) {
			super.onDestroy( ...args );

			this.#dispatchEvent( 'elementor/preview/atomic-widget/destroy' );
			this.#dispatchPreviewEvent( 'elementor/element/destroy' );
		}

		attributes() {
			return {
				...super.attributes(),

				// Mark the widget as atomic, so external APIs (such as the overlay layer) can reference it.
				'data-atomic': '',

				// Make the wrapper is non-existent in terms of CSS to mimic the frontend DOM tree.
				style: 'display: contents !important;',
			};
		}

		// Removes behaviors that are not needed for atomic widgets (that are implemented in the overlay layer).
		behaviors() {
			const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

			const behaviorsAsEntries = Object.entries( super.behaviors() ).filter(
				( [ key ] ) => ! disabledBehaviors.includes( key )
			);

			return Object.fromEntries( behaviorsAsEntries );
		}

		// Change the drag handle because the $el is not the draggable element (`display: contents`).
		getDomElement() {
			return this.$el.find( ':first-child' );
		}

		// Remove the overlay, so we can use the new overlay layer.
		getHandlesOverlay() {
			return null;
		}

		#dispatchEvent( eventType: string ) {
			window.top?.dispatchEvent(
				new CustomEvent( eventType, {
					detail: { id: this.model.get( 'id' ) },
				} )
			);
		}

		#dispatchPreviewEvent( eventType: string ) {
			legacyWindow.elementor?.$preview?.[ 0 ]?.contentWindow.dispatchEvent(
				new CustomEvent( eventType, {
					detail: {
						id: this.model.get( 'id' ),
						type: this.model.get( 'widgetType' ),
						element: this.getDomElement().get( 0 ),
					},
				} )
			);
		}

		getContextMenuGroups() {
			return super.getContextMenuGroups().filter( ( group ) => group.name !== 'save' );
		}
	};
}
