import DOMPurify from 'dompurify';

const SVG_SANITIZE_CONFIG = {
	USE_PROFILES: { svg: true, svgFilters: true },
} as const;

export function sanitizeSvgMarkup( markup: string ): string | null {
	if ( ! markup.includes( '<svg' ) ) {
		return null;
	}

	const sanitized = DOMPurify.sanitize( markup, SVG_SANITIZE_CONFIG );

	if ( typeof sanitized !== 'string' || ! sanitized.includes( '<svg' ) ) {
		return null;
	}

	return sanitized;
}
