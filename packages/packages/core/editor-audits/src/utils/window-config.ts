type WindowConfig = {
	restNamespace: string;
	nonce: string;
};

declare global {
	interface Window {
		elementorAudits?: WindowConfig;
	}
}

export function getWindowConfig(): WindowConfig {
	const config = window.elementorAudits;

	if ( ! config ) {
		return { restNamespace: 'elementor/v1', nonce: '' };
	}

	return config;
}
