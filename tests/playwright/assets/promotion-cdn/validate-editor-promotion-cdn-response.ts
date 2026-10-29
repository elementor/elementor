import type { EditorPromotionCdnEndpoint } from './editor-promotion-cdn-endpoints';

const ELEMENTOR_HOST_SUFFIX = '.elementor.com';
const ELEMENTOR_ROOT_HOST = 'elementor.com';

export type EditorPromotionCdnValidationIssue = {
	endpointPath: string;
	message: string;
};

const isNonEmptyRecord = ( value: unknown ): value is Record<string, unknown> => {
	return 'object' === typeof value && null !== value && ! Array.isArray( value ) && Object.keys( value ).length > 0;
};

const isValidElementorHttpsUrl = ( value: unknown ): boolean => {
	if ( 'string' !== typeof value || '' === value.trim() ) {
		return false;
	}

	let parsed: URL;

	try {
		parsed = new URL( value );
	} catch {
		return false;
	}

	if ( 'https:' !== parsed.protocol ) {
		return false;
	}

	const host = parsed.hostname.toLowerCase();

	return host === ELEMENTOR_ROOT_HOST || host.endsWith( ELEMENTOR_HOST_SUFFIX );
};

export const validateEditorPromotionCdnPayload = (
	endpoint: EditorPromotionCdnEndpoint,
	payload: unknown,
): EditorPromotionCdnValidationIssue[] => {
	const issues: EditorPromotionCdnValidationIssue[] = [];

	if ( ! isNonEmptyRecord( payload ) ) {
		issues.push( {
			endpointPath: endpoint.path,
			message: 'CDN payload must be a non-empty object.',
		} );

		return issues;
	}

	if ( Object.prototype.hasOwnProperty.call( payload, 'is_active' ) && 'boolean' !== typeof payload.is_active ) {
		issues.push( {
			endpointPath: endpoint.path,
			message: 'is_active must be a boolean when present.',
		} );
	}

	const isActive = true === payload.is_active;

	if ( ! isActive ) {
		return issues;
	}

	for ( const field of endpoint.activeStringFieldsWhenActive ) {
		const value = payload[ field ];

		if ( 'string' !== typeof value || '' === value.trim() ) {
			issues.push( {
				endpointPath: endpoint.path,
				message: `Active campaign requires non-empty string field "${ field }".`,
			} );
		}
	}

	for ( const field of endpoint.activeUrlFields ) {
		const value = payload[ field ];

		if ( undefined === value || '' === value ) {
			continue;
		}

		if ( ! isValidElementorHttpsUrl( value ) ) {
			issues.push( {
				endpointPath: endpoint.path,
				message: `Field "${ field }" must be an https URL on elementor.com when set.`,
			} );
		}
	}

	if (
		'conversion-banner' === endpoint.jsonKey &&
		isActive &&
		( 'string' !== typeof payload.title || 'string' !== typeof payload.cta_url )
	) {
		issues.push( {
			endpointPath: endpoint.path,
			message: 'Active conversion banner requires title and cta_url (Elementor PHP gate).',
		} );
	}

	return issues;
};

export const validateEditorPromotionCdnDocument = (
	endpoint: EditorPromotionCdnEndpoint,
	document: unknown,
): EditorPromotionCdnValidationIssue[] => {
	if ( ! isNonEmptyRecord( document ) ) {
		return [
			{
				endpointPath: endpoint.path,
				message: 'Response JSON must be an object.',
			},
		];
	}

	const payload = document[ endpoint.jsonKey ];

	if ( undefined === payload ) {
		return [
			{
				endpointPath: endpoint.path,
				message: `Response must include top-level key "${ endpoint.jsonKey }".`,
			},
		];
	}

	return validateEditorPromotionCdnPayload( endpoint, payload );
};
