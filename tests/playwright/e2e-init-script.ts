declare global {
	interface Window {
		__ELEMENTOR_E2E__?: boolean;
	}
}

export function installElementorE2eFlag(): void {
	window.__ELEMENTOR_E2E__ = true;
}
