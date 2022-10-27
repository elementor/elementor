import { getElementDefaults } from '../../api';
import { isPopulatedObject } from '../../utils';

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

		const elementDefaultSettings = getElementDefaults( widgetType || elType );

		if ( ! isPopulatedObject( elementDefaultSettings ) ) {
			return true;
		}

		const settings = {
			...elementDefaultSettings,
			...( args.model.settings || {} ),
		};

		[ '__dynamic__', '__globals__' ].forEach( ( type ) => {
			if ( ! isPopulatedObject( elementDefaultSettings[ type ] ) ) {
				return;
			}

			settings[ type ] = {
				...( elementDefaultSettings[ type ] || {} ),
				...( args.model.settings?.[ type ] || {} ),
			};
		} );

		args.model = {
			...args.model,
			settings,
		};

		return true;
	}
}
