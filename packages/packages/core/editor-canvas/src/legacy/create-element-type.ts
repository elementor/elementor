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
		onRender( ...args: unknown[] ) {
			super.onRender( ...args );
			this.#notifyOverlayLayerOfRender();
		}

		onDestroy( ...args: unknown[] ) {
			super.onDestroy( ...args );
			this.#notifyOverlayLayerOfDestroy();
		}

		attributes() {
			return {
				...super.attributes(),
				...this.#getAtomicWidgetAttributes(),
			};
		}

		behaviors() {
			const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];
			const parentBehaviors = super.behaviors();
			const behaviorsAsEntries = Object.entries( parentBehaviors ).filter(
				( [ key ] ) => ! disabledBehaviors.includes( key )
			);
			return Object.fromEntries( behaviorsAsEntries );
		}

		getDomElement() {
			return this.#getFirstChildAsDragHandle();
		}

		getHandlesOverlay() {
			return this.#disableDefaultOverlay();
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

		className() {
			const editorSettings = ( this.model as any ).get( 'editor_settings' ) || {};
			const isCssConverterWidget = editorSettings.css_converter_widget || editorSettings.disable_base_styles;
			
			if ( isCssConverterWidget ) {
				const originalClasses = ( this as any ).constructor.__super__.className.call( this );
				const widgetType = ( this.model as any ).get( 'widgetType' ) || ( this.model as any ).get( 'elType' );
				const baseClassPattern = new RegExp( `\\b${widgetType}-base\\b`, 'g' );
				return originalClasses.replace( baseClassPattern, '' ).trim();
			}
			
			return ( this as any ).constructor.__super__.className.call( this );
		}

		#notifyOverlayLayerOfRender() {
			this.#dispatchEvent( 'elementor/preview/atomic-widget/render' );
			this.#dispatchPreviewEvent( 'elementor/element/render' );
		}

		#notifyOverlayLayerOfDestroy() {
			this.#dispatchEvent( 'elementor/preview/atomic-widget/destroy' );
			this.#dispatchPreviewEvent( 'elementor/element/destroy' );
		}

		#getAtomicWidgetAttributes() {
			return {
				'data-atomic': '',
				style: 'display: contents !important;',
			};
		}


		#getFirstChildAsDragHandle() {
			return this.$el.find( ':first-child' );
		}

		#disableDefaultOverlay() {
			return null;
		}


	};
}
