export const QUERY_KEY = 'css-classes-usage';

export type CssClassID = string;

export const ContentType = {
	Header: 'header',
	Footer: 'footer',
	Page: 'wp-page',
	Post: 'wp-post',
	Popup: 'popup',
};

type CssClassUsageContent = {
	elements: string[];
	pageId: string;
	total: number;
	title: string;
	type: keyof typeof ContentType;
};

export type CssClassUsage = Record< CssClassID, CssClassUsageContent[] >;

export type EnhancedCssClassUsageContent = { content: CssClassUsageContent[]; total: number };

export type EnhancedCssClassUsage = Record< CssClassID, EnhancedCssClassUsageContent >;
