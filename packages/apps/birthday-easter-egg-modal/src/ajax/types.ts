export type ExtendedWindow = Window & {
	elementorCommon?: {
		ajax?: {
			addRequest: (
				action: string,
				options: { data?: Record< string, unknown > },
				immediately?: boolean
			) => unknown;
		};
	};
};
