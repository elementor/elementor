export type State = {
	documents: Record<Document['id'], Document>,
	currentDocumentId: Document['id'],
}

export type Document = {
	id: number,
	title: string,
	status: string, // union?
	isModified: boolean,
	isSaving: boolean,
	lastEdited: number, // number?
	isSavingDraft: boolean, // ??
	userCan: {
		publish: boolean,
	},
};
