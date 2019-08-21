export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'document/elements/repeater';
	}

	defaultCommands() {
		return {
			settings: ( args ) => {
				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				}

				const settingsModel = args.element.getEditModel().get( 'settings' ),
					subSettings = settingsModel.get( args.key ),
					item = subSettings.at( args.index );

				item.set( args.settings );

				settingsModel.trigger( `change:external:${ args.key }` );

				args.element.renderOnChange( settingsModel );
			},
		};
	}

	defaultShortcuts() {
		return {
		};
	}
}
