const createAtomicInlineEditingType = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-paragraph' );
	const BaseElementView = elementor.modules.elements.views.BaseElement;

	class AtomicInlineEditingView extends AtomicElementBaseView {
		get emptyView() {
			return null;
		}

		droppableInitialize() {
			// No-op to disable drag and drop
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
			return super.className().replace( 'e-con', 'e-atomic-widget-like' );
		}

		getContextMenuGroups() {
			// Return base groups without the save actions added by AtomicElementBaseView
			return BaseElementView.prototype.getContextMenuGroups.apply( this, arguments );
		}

		getEditButtons() {
			const elementData = elementor.getElementData( this.model );
			const editTools = {};

			if ( ! this.getContainer().isLocked() ) {
				if ( elementor.getPreferences( 'edit_buttons' ) && $e.components.get( 'document/elements' ).utils.allowAddingWidgets() ) {
					editTools.duplicate = {
						/* Translators: %s is the title. */
						title: sprintf( __( 'Duplicate %s', 'elementor' ), elementData.title ),
						icon: 'clone',
					};
				}

				editTools.remove = {
					/* Translators: %s is the title. */
					title: sprintf( __( 'Delete %s', 'elementor' ), elementData.title ),
					icon: 'close',
				};
			}

			return editTools;
		}

		getChildType() {
			return [];
		}
	}

	return Object.entries( elementor.config.elements ).reduce( ( carry, [ key, element ] ) => {
		if ( element.is_inline_editing ) {
			carry.push( new elementor.modules.elements.types.AtomicElementBase( key, AtomicInlineEditingView ) );
		}

		return carry;
	}, [] );
};

export default createAtomicInlineEditingType;
