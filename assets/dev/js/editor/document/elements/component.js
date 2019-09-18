import * as Commands from './commands/commands';
import './hooks/hooks';

export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return {
			create: ( args ) => ( new Commands.Create( args ) ).run(),
			createSection: ( args = {} ) => ( new Commands.CreateSection( args ) ).run(),
			copy: ( args ) => ( new Commands.Copy( args ) ).run(),
			copyAll: () => {
				$e.run( 'document/elements/copy', {
					containers: Object.values( elementor.getPreviewView().children._views ).map( ( view ) => view.getContainer() ),
					elementsType: 'section',
				} );
			},
			duplicate: ( args ) => ( new Commands.Duplicate( args ) ).run(),
			delete: ( args ) => ( new Commands.Delete( args ) ).run(),
			empty: ( args ) => ( new Commands.Empty( args ) ).run(),
			import: ( args ) => {
				if ( ! args.model ) {
					throw Error( 'model is required.' );
				}

				if ( ! args.data ) {
					throw Error( 'data is required.' );
				}

				const { model, data } = args,
					options = args.options || {},
					historyId = $e.run( 'document/history/startLog', {
						type: 'add',
						title: elementor.translate( 'template' ),
						subTitle: model.get( 'title' ),
						elementType: 'template',
						returnValue: true,
					} );

				elementor.getPreviewView().addChildModel( data.content, options );

				if ( options.withPageSettings ) {
					elementor.settings.page.model.setExternalChange( data.page_settings );
				}

				$e.run( 'document/history/endLog', { id: historyId } );
			},
			move: ( args ) => ( new Commands.Move( args ) ).run(),
			paste: ( args ) => ( new Commands.Paste( args ) ).run(),
			pasteStyle: ( args ) => ( new Commands.PasteStyle( args ) ).run(),
			resetStyle: ( args ) => ( new Commands.ResetStyle( args ) ).run(),
			resizeColumn: ( args ) => ( new Commands.ResizeColumn( args ) ).run(),
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
