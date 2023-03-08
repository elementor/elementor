export type Document = {
	id: number,
	title: string,
	type: {
		value: string,
		label: string,
	},
	status: {
		value: string,
		label: string,
	},
	isDirty: boolean,
	isSaving: boolean,
	isSavingDraft: boolean,
	userCan: {
		publish?: boolean,
	},
};

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record<string, V1Document>,
			getCurrentId: () => number,
			getInitialId: () => number,
			getCurrent: () => V1Document,
		}
	}
}

export type V1Document = {
	id: number,
	config: {
		type: string,
		user: {
			can_publish: boolean,
		},
		revisions: {
			current_id: number,
		}
		panel: {
			title: string,
		}
		status: {
			value: string,
			label: string,
		}
	},
	editor: {
		isChanged: boolean,
		isSaving: boolean,
	},
	container: {
		settings: V1Model<{
			post_title: string,
		}>,
	}
}

type V1Model<T> = {
	get: <K extends keyof T = keyof T>( key: K ) => T[K],
}
