export type ExtendedWindow = Window & {
	elementor: {
		editorEvents: {
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
	};
};

export type { Props as ActionProps } from './components/actions/action';
export type { Props as ToggleActionProps } from './components/actions/toggle-action';
export type { Props as LinkProps } from './components/actions/link';
