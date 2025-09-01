import { type Document } from '@elementor/editor-documents';

export default function createMockDocument( {
	id,
	title,
	status,
	type,
	isDirty,
	isSaving,
	isSavingDraft,
	userCan,
	links,
}: Partial< Document > = {} ): Document {
	return {
		id: id ?? 1,
		title: title ?? `Document ${ id }`,
		status: status ?? {
			value: 'publish',
			label: 'Published',
		},
		type: type ?? {
			value: 'wp-page',
			label: 'Page',
		},
		links: links ?? {
			platformEdit: `https://localhost/wp-admin/post.php?post=${ id }&action=edit`,
			permalink: `https://localhost/?p=${ id }`,
		},
		isDirty: isDirty ?? false,
		isSaving: isSaving ?? false,
		isSavingDraft: isSavingDraft ?? false,
		userCan: userCan ?? {
			publish: true,
		},
		permissions: {
			allowAddingWidgets: true,
			showCopyAndShare: true,
		},
	};
}
