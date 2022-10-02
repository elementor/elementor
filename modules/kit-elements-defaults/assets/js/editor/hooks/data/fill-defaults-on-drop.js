export default class FillDefaultsOnDrop extends $e.modules.hookData.Dependency {
	getCommand() {
		return 'preview/drop';
	}

	getId() {
		return 'fill-defaults-on-drop';
	}

	getConditions( args ) {
		return args.model?.widgetType || args.model?.elType;
	}

	apply( args ) {
		const { model } = args,
			{ elType, widgetType } = model;

		const allSettings = $e.data.cache.storage.getItem( 'kit-elements-defaults' ) || {},
			elementSettings = allSettings[ widgetType || elType ];

		if ( ! elementSettings ) {
			return true;
		}

		args.model = {
			...args.model,
			settings: {
				...args.model.settings,
				...elementSettings,
			},
		};

		return true;
	}
}
