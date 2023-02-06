import { Document } from '../types';

export function createMockDocument( {
	id = 1,
	title = `Document ${ id }`,
	status,
	type,
	isDirty = false,
	isSaving = false,
	isSavingDraft = false,
	userCan,
}: Partial<Document> = {} ): Document {
	return {
		id,
		title,
		status: status || {
			value: 'publish',
			label: 'Published',
		},
		type: type || {
			value: 'wp-page',
			label: 'Page',
		},
		isDirty,
		isSaving,
		isSavingDraft,
		userCan: userCan || {
			publish: true,
		},
	};
}
