const createAtomicSpanChildType = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-html-span-child' );

	class AtomicSpanChildView extends AtomicElementBaseView {
		get emptyView() {
			return null;
		}

		droppableInitialize() {
			// No-op
		}

		isDroppingAllowed() {
			return false;
		}

		behaviors() {
			const behaviors = super.behaviors();
			delete behaviors.Sortable;
			return behaviors;
		}

		className() {
			// Remove e-con and add identification class
			return super.className().replace( 'e-con', 'e-atomic-span-child' );
		}

		updateHandlesPosition() {
			// Suppress handles
		}

		getContextMenuGroups() {
			return [];
		}

		getEditButtons() {
			return {};
		}

		onEditRequest( options ) {
			// If request comes from navigator (usually has scrollIntoView), allow editing this element.
			// Otherwise (canvas click), delegate to parent paragraph.
			if ( options && options.scrollIntoView ) {
				return super.onEditRequest( options );
			}

			if ( this._parent && 'e-paragraph' === this._parent.model.get( 'elType' ) ) {
				this._parent.model.trigger( 'request:edit' );
			} else {
				super.onEditRequest( options );
			}
		}

		getChildType() {
			return [];
		}
	}

	return new elementor.modules.elements.types.AtomicElementBase( 'e-html-span-child', AtomicSpanChildView );
};

export default createAtomicSpanChildType;
