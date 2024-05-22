import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as commandsInternal from './commands-internal/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
	}

	defaultUtils() {
		return {
			isValidChild: ( childModel, parentModel ) => parentModel.isValidChild( childModel ),
			isValidGrandChild: ( childModel, targetContainer ) => {
				let result;

				const childElType = childModel.get( 'elType' );

				switch ( targetContainer.model.get( 'elType' ) ) {
					case 'document':
						result = true;
						break;

					case 'section':
						result = 'widget' === childElType;
						break;

					default:
						result = false;
				}

				return result;
			},
			isSameElement: ( sourceModel, targetContainer ) => {
				const targetElType = targetContainer.model.get( 'elType' ),
					sourceElType = sourceModel.get( 'elType' );

				if ( targetElType !== sourceElType ) {
					return false;
				}

				if ( 'column' === targetElType && 'column' === sourceElType ) {
					return true;
				}

				return targetContainer.model.get( 'isInner' ) === sourceModel.get( 'isInner' );
			},
			getPasteOptions: ( sourceModel, targetContainer ) => {
				const result = {};

				result.isValidChild = targetContainer.model.isValidChild( sourceModel );
				result.isSameElement = this.utils.isSameElement( sourceModel, targetContainer );
				result.isValidGrandChild = this.utils.isValidGrandChild( sourceModel, targetContainer );

				return result;
			},
			isPasteEnabled: ( targetContainer ) => {
				const storage = elementorCommon.storage.get( 'clipboard' );

				// No storage? no paste.
				if ( ! storage || ! storage?.elements?.length || 'elementor' !== storage?.type ) {
					return false;
				}

				if ( ! ( storage.elements[ 0 ] instanceof Backbone.Model ) ) {
					storage.elements[ 0 ] = new Backbone.Model( storage.elements[ 0 ] );
				}

				const pasteOptions = this.utils.getPasteOptions( storage.elements[ 0 ], targetContainer );

				return Object.values( pasteOptions ).some(
					( opt ) => !! opt,
				);
			},
			allowAddingWidgets() {
				return elementor.config.document.panel.allow_adding_widgets ?? true;
			},
			showNavigator() {
				return elementor.config.document.panel.show_navigator ?? true;
			},
			showCopyAndShareButton() {
				return elementor.config.document.panel.show_copy_and_share ?? false;
			},
			getTitleForLibraryClose() {
				return elementor.config.document.panel.library_close_title ?? '';
			},
		};
	}
}
