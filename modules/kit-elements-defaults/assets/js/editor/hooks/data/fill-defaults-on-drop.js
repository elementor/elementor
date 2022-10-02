import store from '../../store';

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

		const elementSettings = store.get( widgetType || elType );

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
