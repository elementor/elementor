export function isProUser(): boolean {
	const hasPro = window.elementor?.helpers?.hasPro?.() ?? false;

	if ( ! hasPro ) {
		return false;
	}

	const isProActive = window.elementorPro?.config?.isActive ?? false;

	return isProActive;
}
