export function hasProInstalled(): boolean {
	return window.elementor?.helpers?.hasPro?.() ?? false;
}

export function isProActive(): boolean {
	if ( ! hasProInstalled() ) {
		return false;
	}

	return window.elementorPro?.config?.isActive ?? false;
}
