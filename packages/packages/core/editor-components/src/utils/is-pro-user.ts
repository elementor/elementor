type ExtendedWindow = Window & {
	elementor?: {
		helpers?: {
			hasPro?: () => boolean;
		};
	};
	elementorPro?: {
		config?: {
			isActive?: boolean;
		};
	};
};

export function isProUser(): boolean {
	const extendedWindow = window as unknown as ExtendedWindow;

	const hasPro = extendedWindow.elementor?.helpers?.hasPro?.() ?? false;

	if ( ! hasPro ) {
		return false;
	}

	const isProActive = extendedWindow.elementorPro?.config?.isActive ?? false;

	return isProActive;
}
