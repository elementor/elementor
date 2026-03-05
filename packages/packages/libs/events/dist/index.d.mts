declare const useMixpanel: () => {
	dispatchEvent: ((name: string, data: unknown) => void) | undefined;
	config:
		| {
				locations?: Record<string, string>;
				secondaryLocations?: Record<string, string>;
				names?: Record<string, Record<string, string>>;
				triggers?: Record<string, string>;
				elements?: Record<string, string>;
				appTypes?: Record<string, string>;
				targetTypes?: Record<string, string>;
				interactionResults?: Record<string, string>;
				targetNames?: Record<string, Record<string, string>>;
		  }
		| undefined;
};
declare const trackEvent: <
	T extends {
		eventName: string;
	} & Record<string, unknown>,
>(
	event: T
) => void;
declare const getMixpanel: () => {
	dispatchEvent: ((name: string, data: unknown) => void) | undefined;
	config:
		| {
				locations?: Record<string, string>;
				secondaryLocations?: Record<string, string>;
				names?: Record<string, Record<string, string>>;
				triggers?: Record<string, string>;
				elements?: Record<string, string>;
				appTypes?: Record<string, string>;
				targetTypes?: Record<string, string>;
				interactionResults?: Record<string, string>;
				targetNames?: Record<string, Record<string, string>>;
		  }
		| undefined;
};

export { getMixpanel, trackEvent, useMixpanel };
