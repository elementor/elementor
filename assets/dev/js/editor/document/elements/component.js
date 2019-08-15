import Commands from './commands/commands';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return {
			create: ( args ) => ( new Commands.Create( args ) ).run(),

			createSection: ( args = {} ) => {
				const options = args.options || {},
					elements = [];

				// To prevent useless triggers in column creation.
				options.edit = false; // leonid: does it still relevant?

				for ( let loopIndex = 0; loopIndex < args.columns; loopIndex++ ) {
					elements.push( {
						id: elementor.helpers.getUniqueID(),
						elType: 'column',
						settings: {},
						elements: [],
					} );
				}

				const section = elementor.getPreviewView().addChildElement( { elements }, options );

				if ( args.structure ) {
					section.setStructure( args.structure );
				}

				section.getEditModel().trigger( 'request:edit' );

				return section;
			},

			copy: ( args ) => ( new Commands.Copy( args ) ).run(),

			copyAll: () => {
				$e.run( 'document/elements/copy', {
					elements: Object.values( elementor.getPreviewView().children._views ),
					elementsType: 'section',
				} );
			},

			duplicate: ( args ) => {
				if ( ! args.element ) {
					throw Error( 'element is required.' );
				}

				const { element } = args,
					parent = element._parent,
					at = element._index + 1;

				$e.run( 'document/elements/create', {
					element: parent,
					data: element.model.clone(),
					options: { at },
				} );
			},
			delete: ( args ) => ( new Commands.Delete( args ) ).run(),

			empty: ( args = {} ) => {
				if ( args.force ) {
					elementor.elements.reset();
					return;
				}

				elementor.getClearPageDialog().show();
			},

			move: ( args ) => ( new Commands.Move( args ) ).run(),

			paste: ( args ) => ( new Commands.Paste( args ) ).run(),

			pasteStyle: ( args ) => ( new Commands.PasteStyle( args ) ).run(),

			resetStyle: ( args ) => ( new Commands.ResetStyle( args ) ).run(),

			settings: ( args ) => ( new Commands.Settings( args ) ).run(),
		};
	}

	defaultShortcuts() {
		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
			},
			duplicate: {
				keys: 'ctrl+d',
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().isPasteEnabled();
				},
			},
			pasteStyle: {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'transfer' );
				},
			},
		};
	}
}
