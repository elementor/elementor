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

		if (
			! elementSettings ||
			'object' !== typeof elementSettings ||
			! Object.keys( elementSettings ).length
		) {
			return true;
		}

		const settings = { ...( args.model.settings || {} ), ...elementSettings };

		[ '__dynamic__', '__globals__' ].forEach( ( type ) => {
			if (
				! elementSettings[ type ] ||
				typeof elementSettings[ type ] !== 'object' ||
				! Object.keys( elementSettings.__globals__ ).length
			) {
				return;
			}

			settings[ type ] = {
				...( args.model.settings?.[ type ] || {} ),
				...( elementSettings[ type ] || {} ),
			};
		} );

		args.model = {
			...args.model,
			settings,
		};

		return true;
	}
}
