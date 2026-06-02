export type AuditCategory = 'health' | 'seo' | 'accessibility' | 'performance' | 'compliance';

export type AuditSeverity = 'error' | 'warning' | 'info';

export type AuditDescriptor = {
	id: string;
	title: string;
	description: string;
	fixHint: string;
	categories: AuditCategory[];
	severity: AuditSeverity;
	weight: number;
};

export type AuditViolation = {
	auditId: string;
	elementId?: string;
	targetHint?: 'page-settings' | 'site-settings' | 'element-settings';
	externalUrl?: string;
	label: string;
	detail?: string;
};

export type AuditResult =
	| { status: 'pass' }
	| { status: 'fail'; violations: AuditViolation[] }
	| { status: 'skipped'; reason: string };

export type PageContextResponse = {
	post_title: string | null;
	post_excerpt: string | null;
	featured_image_id: number | null;
	image_sizes: Record<
		number,
		{
			width: number;
			height: number;
			filesize_bytes: number;
			mime: string;
			src: string;
		}
	>;
	kit_id: number;
	kit_is_default_unchanged: boolean;
	privacy_policy_url: string | null;
	privacy_settings_url: string;
};

export type ElementSnapshotNode = {
	id: string;
	elType: string;
	widgetType?: string;
	settings: Record< string, unknown >;
	elements: ElementSnapshotNode[];
};

export type ElementsModelSnapshot = {
	documentId: number;
	tree: ElementSnapshotNode[];
};

export type KitSnapshot = {
	id: number;
	globals: {
		colors: Array< { id: string; value: string } >;
		fonts: Array< { id: string; value: string } >;
	};
};

export type AuditContext = {
	documentId: number;
	elements: ElementsModelSnapshot;
	pageContext: PageContextResponse;
	kit: KitSnapshot;
};

export type AuditEvaluator = ( ctx: AuditContext ) => AuditResult | Promise< AuditResult >;

export type PageAuditReport = {
	documentId: number;
	runAt: number;
	overall: number;
	categories: Record< AuditCategory, { score: number; failed: number; total: number } >;
	auditResults: Array< { descriptor: AuditDescriptor; result: AuditResult } >;
};
