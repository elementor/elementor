export type ControlProps< TControlProps = unknown > = TControlProps & {
	context: {
		elementId: string;
	};
};

export type ExtendedWindow = Window & {
	elementorFrontend?: {
		config?: {
			is_rtl?: boolean;
		};
	};
};
