export default class FillDefaultsOnDrop extends $e.modules.hookData.Dependency {
	getCommand() {
		return 'preview/drop';
	}

	getId() {
		return 'fill-defaults-on-drop';
	}

	getConditions( args ) {
		return args.model.elType || args.model.widgetType;
	}

	apply( args ) {
		const { model } = args,
			{ elType, widgetType } = model;

		const allSettings = $e.data.cache.storage.getItem( 'kits-elements-defaults' ) || {},
			elementSettings = allSettings[ widgetType || elType ];

		console.log( elementSettings );

		// Get all the default settings of the element from the kit.
		// and change the args.model to the new settings {...model, settings: { ...model.settings, ...defaults } }

		return true;
	}
}
