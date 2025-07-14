export const QUERY_KEY = 'css-classes-usage';

export type CssClassID = string;

export type ContentType = 'header' | 'footer' | 'wp-page' | 'wp-post' | 'popup';

type CssClassUsageContent = {
	elements: string[];
	pageId: string;
	total: number;
	title: string;
	type: ContentType;
};

export type CssClassUsage = Record< CssClassID, CssClassUsageContent[] >;

export type EnhancedCssClassUsageContent = { content: CssClassUsageContent[]; total: number };

export type EnhancedCssClassUsage = Record< CssClassID, EnhancedCssClassUsageContent >;
