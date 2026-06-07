export type BirthdayEasterEggModalConfig = {
	header: string;
	content: string;
	hero: string;
	lottie: object;
	cta: {
		label: string;
		url: string;
	};
};

type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			birthdayEasterEggModal?: BirthdayEasterEggModalConfig;
		};
	};
};

export function getModalConfig(): BirthdayEasterEggModalConfig | null {
	return ( window as ExtendedWindow ).elementor?.config?.birthdayEasterEggModal ?? null;
}
