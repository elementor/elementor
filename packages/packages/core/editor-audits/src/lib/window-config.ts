import { type AuditDescriptor } from '../types';

type WindowConfig = {
	audits: AuditDescriptor[];
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
		return { audits: [], restNamespace: 'elementor/v1', nonce: '' };
	}

	return config;
}
