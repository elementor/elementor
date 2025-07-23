export const QUERY_KEY = 'css-classes-usage';

export type CssClassID = string;

export type ContentType = 'header' | 'footer' | 'wp-page' | 'wp-post' | 'popup' | string;

export type CssClassUsageContent = {
	elements: string[];
	pageId: string;
	total: number;
	title: string;
	type: ContentType;
};

export type CssClassUsage = Record< CssClassID, Array< CssClassUsageContent > >;

export type EnhancedCssClassUsageContent = { content: Array< CssClassUsageContent >; total: number };

export type EnhancedCssClassUsage = Record< CssClassID, EnhancedCssClassUsageContent >;
