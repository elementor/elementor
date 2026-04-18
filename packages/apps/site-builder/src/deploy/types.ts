export const DEPLOY_DESIGN_SYSTEM_PATH = '/elementor/v1/site-builder/deploy-design-system';

export interface DeployPage {
	id: string;
	title: string;
	content: object[];
}

export interface DeployThemePart {
	title: string;
	type: 'header' | 'footer' | 'error-404' | 'single-post';
	content: object[];
	themeBuilderCondition?: string;
}

export interface DeploySamplePost {
	title: string;
	content: string;
}

export interface DeployLogo {
	url: string;
	filename: string;
}

export interface DeployMenuItem {
	title: string;
	pageId: string;
}

export interface DeployGlobalClasses {
	items: Record< string, unknown >;
	order: string[];
}

export interface DeployGlobalVariables {
	data: Record< string, unknown >;
	watermark: number;
	version: number;
}

export interface DeployPayload {
	pages: DeployPage[];
	header?: DeployThemePart;
	footer?: DeployThemePart;
	error404?: DeployThemePart;
	singlePost?: DeployThemePart;
	kitSettings: Record< string, unknown >;
	globalClasses?: DeployGlobalClasses;
	globalVariables?: DeployGlobalVariables;
	menus: {
		header: DeployMenuItem[];
		footer: DeployMenuItem[];
	};
	siteMeta: {
		title: string;
		tagline: string;
	};
	logo?: DeployLogo;
	samplePosts?: DeploySamplePost[];
}

export interface DeployResult {
	status: 'success' | 'error';
	homeUrl?: string;
	homePageId?: number;
	error?: string;
	errors?: string[];
}

export interface WpPost {
	id: number;
}

export interface WpMenu {
	id: number;
}

export interface ElementorSettingResponse {
	success: boolean;
	data?: { value: unknown };
}
