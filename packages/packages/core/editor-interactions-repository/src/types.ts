export type InteractionItem = {
	elementId: string;
	dataId: string; // The data-id attribute for DOM selection
	interactions: string; // JSON string of interactions array
};

export type InteractionsCollection = InteractionItem[];

export type InteractionsProvider = {
	getKey: () => string;
	priority: number;
	subscribe: ( callback: () => void ) => () => void;
	actions: {
		all: () => InteractionItem[];
	};
};

