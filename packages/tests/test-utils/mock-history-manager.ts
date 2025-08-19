import type { HistoryItem, WindowWithHistoryManager } from '@elementor/editor-v1-adapters';

export function mockHistoryManager() {
	const history = createFakeHistory();

	return {
		instance: history,

		beforeEach: () => {
			const extendedWindow = window as unknown as Window & WindowWithHistoryManager;

			extendedWindow.elementor = {
				...extendedWindow.elementor,
				documents: {
					...extendedWindow.elementor?.documents,
					getCurrent: () => ( { history } ),
				},
			};
		},

		afterEach: () => {
			history.clear();
		},
	};
}

function createFakeHistory() {
	let item: HistoryItem | null = null;

	return {
		undo: () => {
			item?.restore( item, false );
		},
		redo: () => {
			item?.restore( item, true );
		},
		clear: () => {
			item = null;
		},
		get: () => {
			return item;
		},
		addItem: ( i: HistoryItem ) => {
			item = i;
		},
	};
}
