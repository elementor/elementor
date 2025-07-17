import { type StylesProvider, type UserCapabilities } from '../types';

export type CreateStylesProviderOptions = {
	key: string | ( () => string );
	priority?: number;
	limit?: number;
	subscribe?: ( callback: () => void ) => () => void;
	labels?: {
		singular: string;
		plural: string;
	};
	actions: {
		all: StylesProvider[ 'actions' ][ 'all' ];
		get: StylesProvider[ 'actions' ][ 'get' ];
		resolveCssName?: StylesProvider[ 'actions' ][ 'resolveCssName' ];
		create?: StylesProvider[ 'actions' ][ 'create' ];
		delete?: StylesProvider[ 'actions' ][ 'delete' ];
		update?: StylesProvider[ 'actions' ][ 'update' ];
		updateProps?: StylesProvider[ 'actions' ][ 'updateProps' ];
		updateCustomCss?: StylesProvider[ 'actions' ][ 'updateCustomCss' ];
	};
	capabilities?: UserCapabilities;
};

const DEFAULT_LIMIT = 10000;
const DEFAULT_PRIORITY = 10;

export function createStylesProvider( {
	key,
	priority = DEFAULT_PRIORITY,
	limit = DEFAULT_LIMIT,
	subscribe = () => () => {},
	labels,
	actions,
	capabilities,
}: CreateStylesProviderOptions ): StylesProvider {
	return {
		getKey: typeof key === 'string' ? () => key : key,
		priority,
		limit,
		capabilities,
		subscribe,
		labels: {
			singular: labels?.singular ?? null,
			plural: labels?.plural ?? null,
		},
		actions: {
			all: actions.all,
			get: actions.get,
			resolveCssName: actions.resolveCssName ?? ( ( id ) => id ),
			create: actions.create,
			delete: actions.delete,
			update: actions.update,
			updateProps: actions.updateProps,
			updateCustomCss: actions.updateCustomCss,
		},
	};
}
