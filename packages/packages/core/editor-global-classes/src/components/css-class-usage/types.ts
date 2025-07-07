export const QUERY_KEY = 'css-classes-usage';

export type CssClassID = string;

export type CssClassUsageContent = {
	elements: string[];
	pageId: string;
	total: number;
	title: string;
};

export type CssClassUsage = Record< CssClassID, CssClassUsageContent[] >;

export type EnhancedCssClassUsageContent = { content: CssClassUsageContent[]; total: number };

export type EnhancedCssClassUsage = Record< CssClassID, EnhancedCssClassUsageContent >;
