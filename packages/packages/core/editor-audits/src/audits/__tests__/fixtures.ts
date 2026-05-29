import { type AuditContext, type ElementSnapshotNode, type KitSnapshot, type PageContextResponse } from '../../types';

const DEFAULT_PAGE_CONTEXT: PageContextResponse = {
	post_title: 'Hello',
	post_excerpt: 'A short summary',
	featured_image_id: 99,
	image_sizes: {},
	kit_id: 1,
	kit_is_default_unchanged: false,
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
