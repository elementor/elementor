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

		const settings = {
			...( args.model.settings || {} ),
			...elementSettings,
			__globals__: {
				...( args.model.settings?.__globals__ || {} ),
				...( elementSettings.__globals__ || {} ),
			},
			__dynamic__: {
				...( args.model.settings?.__dynamic__ || {} ),
				...( elementSettings.__dynamic__ || {} ),
			},
		};

		args.model = {
			...args.model,
			settings,
		};

		return true;
	}
}
