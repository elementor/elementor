export type ExtendedWindow = Window & {
	elementorCommon: {
		eventsManager: {
			dispatchEvent: ( name: string, data: Record< string, string > ) => void;
			config: {
				locations: Record< string, string >;
				secondaryLocations: Record< string, string >;
				triggers: Record< string, string >;
				elements: Record< string, string >;
				names: {
					topBar: Record< string, string >;
				};
			};
		};

		ajax?: {
			addRequest: ( action: string, options?: Record< string, unknown > ) => Promise< unknown >;
		};

		config: {
			library_connect: {
				is_connected: boolean;
			};
		};
	};

	elementorShowInfotip?: {
		shouldShow: string;
	};

	elementor: {
		helpers: {
			hasPro: () => boolean;
		};
		config: {
			user: {
				top_bar: {
					my_elementor_url: string;
					connect_url: string;
				};
			};
		};
	};
	elementorPro: {
		config: {
			isActive: boolean;
		};
	};
	jQuery: {
		fn?: {
			elementorConnect?: ( selector: string ) => never;
		};
	};
};

export type { Props as ActionProps } from './components/actions/action';
export type { Props as ToggleActionProps } from './components/actions/toggle-action';
export type { Props as LinkProps } from './components/actions/link';
