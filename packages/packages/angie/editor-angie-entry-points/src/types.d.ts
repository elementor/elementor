export {};

declare global {
	interface Window {
		Marionette?: {
			Behavior: {
				extend: ( proto: Record< string, unknown > ) => new () => Record< string, unknown >;
			};
		};
		jQuery?: (
			tag: string,
			attrs?: Record< string, string >
		) => {
			html: ( markup: string ) => unknown;
			addClass: ( className: string ) => unknown;
			append: ( text: string ) => unknown;
			tipsy?: ( options: { gravity: string; title: () => string } ) => void;
		};
		ElementorAiConfig?: {
			is_get_started?: boolean | string;
		};
		elementor?: {
			hooks?: {
				addFilter: (
					name: string,
					callback: ( behaviors: Record< string, unknown >, view: unknown ) => Record< string, unknown >,
					priority?: number
				) => void;
			};
		};
	}
}
