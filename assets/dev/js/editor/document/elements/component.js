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
			isValidChild: ( childModel, parentModel ) => {
				const parentElType = parentModel.get( 'elType' ),
					draggedElType = childModel.get( 'elType' ),
					parentIsInner = parentModel.get( 'isInner' ),
					draggedIsInner = childModel.get( 'isInner' );

				// Block's inner-section at inner-section column.
				if ( draggedIsInner && 'section' === draggedElType && parentIsInner && 'column' === parentElType ) {
					return false;
				}

				// Allow only nested containers.
				if ( draggedElType === parentElType && 'container' !== draggedElType ) {
					return false;
				}

				if ( 'section' === draggedElType && ! draggedIsInner && 'column' === parentElType ) {
					return false;
				}

				const childTypes = elementor.helpers.getElementChildType( parentElType );

				return childTypes && -1 !== childTypes.indexOf( childModel.get( 'elType' ) );
			},
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

				result.isValidChild = this.utils.isValidChild( sourceModel, targetContainer.model );
				result.isSameElement = this.utils.isSameElement( sourceModel, targetContainer );
				result.isValidGrandChild = this.utils.isValidGrandChild( sourceModel, targetContainer );

				return result;
			},
			isPasteEnabled: ( targetContainer ) => {
				const storage = elementorCommon.storage.get( 'clipboard' );

				// No storage? no paste.
				if ( ! storage || ! storage[ 0 ] ) {
					return false;
				}

				if ( ! ( storage[ 0 ] instanceof Backbone.Model ) ) {
					storage[ 0 ] = new Backbone.Model( storage[ 0 ] );
				}

				const pasteOptions = this.utils.getPasteOptions( storage[ 0 ], targetContainer );

				return Object.values( pasteOptions ).some(
					( opt ) => !! opt
				);
			},
		};
	}
}
