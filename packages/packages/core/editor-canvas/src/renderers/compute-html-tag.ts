export type ComputeHtmlTagOptions = {
	followLink?: boolean;
};

export const DEFAULT_LINK_TAG = 'a';

type LinkSettings = Record< string, unknown >;

export function computeHtmlTag(
	settings: Record< string, unknown >,
	defaultTag: string,
	options: ComputeHtmlTagOptions = {}
): string {
	const followLink = options.followLink ?? true;

	if ( followLink && settingsHaveActiveLink( settings ) ) {
		const link = settings.link;

		return extractLinkHtmlTag( isRecord( link ) ? link : {} );
	}

	const settingsTag = extractHtmlTagValue( settings.tag );

	if ( null !== settingsTag && '' !== settingsTag ) {
		return settingsTag;
	}

	return defaultTag;
}

function settingsHaveActiveLink( settings: Record< string, unknown > ): boolean {
	const link = settings.link;

	if ( ! isRecord( link ) ) {
		return false;
	}

	const href = extractHtmlTagValue( link.href );

	if ( null !== href && '' !== href ) {
		return true;
	}

	const attributes = link.attributes;

	return typeof attributes === 'string' && '' !== attributes;
}

function extractLinkHtmlTag( link: LinkSettings ): string {
	const tag = extractHtmlTagValue( link.tag );

	if ( null !== tag && '' !== tag ) {
		return tag;
	}

	return DEFAULT_LINK_TAG;
}

function extractHtmlTagValue( value: unknown ): string | null {
	if ( isRecord( value ) && typeof value.value === 'string' ) {
		return value.value;
	}

	if ( typeof value === 'string' ) {
		return value;
	}

	return null;
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && null !== value && ! Array.isArray( value );
}
