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

	defaultStates() {
		return {
			'': {
				initialState: {},
				reducers: {
					create: this.commands.create.reducer,
					delete: this.commands.delete.reducer,
					empty: this.commands.empty.reducer,
					populate: this.commandsInternal.populate.reducer,
					settings: this.commandsInternal[ 'set-settings' ].reducer,
				},
			},
		};
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
		};
	}
}
