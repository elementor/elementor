import { type AuditContext, type ElementSnapshotNode, type KitSnapshot, type PageContextResponse } from '../../types';

const DEFAULT_PAGE_CONTEXT: PageContextResponse = {
	site_identity: {
		site_name_set: true,
		site_description_set: true,
		site_logo_set: true,
		site_favicon_set: true,
	},

	kit_id: 1,
	kit_is_default_unchanged: false,

	post_title: 'Hello',
	post_excerpt: 'A short summary',
	featured_image_id: 99,

	image_sizes: {},

	is_noindex: false,
	reading_settings_url: 'https://example.com/wp-admin/options-reading.php',

	privacy_policy_url: 'https://example.com/privacy-policy',
	privacy_settings_url: 'https://example.com/wp-admin/options-privacy.php',
	ally_plugin_active: true,
	ally_plugin_url: 'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility',
	cookiez_plugin_active: true,
	cookiez_plugin_url: 'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=cookiez',
};

const DEFAULT_KIT: KitSnapshot = {
	id: 1,
	globals: {
		colors: [ { id: 'primary', value: '#000000' } ],
		fonts: [ { id: 'body', value: 'Inter' } ],
	},
};

type Overrides = {
	tree?: ElementSnapshotNode[];
	pageContext?: Partial< PageContextResponse >;
	kit?: KitSnapshot;
};

export function makeContext( overrides: Overrides = {} ): AuditContext {
	return {
		documentId: 1,
		elements: { documentId: 1, tree: overrides.tree ?? [] },
		kit: overrides.kit ?? DEFAULT_KIT,
		pageContext: { ...DEFAULT_PAGE_CONTEXT, ...( overrides.pageContext ?? {} ) },
	};
}

export function makeWidget(
	id: string,
	widgetType: string,
	settings: Record< string, unknown > = {}
): ElementSnapshotNode {
	return { id, elType: 'widget', widgetType, settings, elements: [] };
}

export function makeContainer(
	id: string,
	settings: Record< string, unknown >,
	children: ElementSnapshotNode[] = []
): ElementSnapshotNode {
	return { id, elType: 'container', settings, elements: children };
}
