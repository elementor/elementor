import { type V1Element } from "@elementor/editor-elements";

declare global {
	interface Window {
		elementorCommon?: {
			eventsManager?: {
				dispatchEvent?: (name: string, data: unknown) => void;
				config?: {
					locations?: Record<string, string>;
					secondaryLocations?: Record<string, string>;
					names?: Record<string, Record<string, string>>;
					triggers?: Record<string, string>;
					elements?: Record<string, string>;
				};
			};
		};
		elementor?: {
			selection?: {
				getElements: () => V1Element[];
			};
			getContainer?: (id: string) => V1Element | undefined;
		};
	}
}

export {};
