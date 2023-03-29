import { Document } from '@elementor/documents';

export default function createMockDocument( {
	id,
	title,
	status,
	type,
	isDirty,
	isSaving,
	isSavingDraft,
	userCan,
}: Partial<Document> = {} ): Document {
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
		isDirty: isDirty ?? false,
		isSaving: isSaving ?? false,
		isSavingDraft: isSavingDraft ?? false,
		userCan: userCan ?? {
			publish: true,
		},
	};
}
