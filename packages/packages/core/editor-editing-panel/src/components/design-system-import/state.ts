export type ImportResult = {
	successfulCount: number;
	unsuccessfulCount: number;
};

type Snapshot = {
	isOpen: boolean;
	isImporting: boolean;
	isResultsOpen: boolean;
	lastResult: ImportResult | null;
};

type Listener = () => void;

const listeners = new Set< Listener >();

let snapshot: Snapshot = {
	isOpen: false,
	isImporting: false,
	isResultsOpen: false,
	lastResult: null,
};

const setSnapshot = ( next: Partial< Snapshot > ) => {
	snapshot = { ...snapshot, ...next };
	listeners.forEach( ( listener ) => listener() );
};

export const importDialogState = {
	open: () => setSnapshot( { isOpen: true } ),
	close: () => setSnapshot( { isOpen: false } ),
	markImporting: () => setSnapshot( { isImporting: true } ),
	markIdle: () => setSnapshot( { isImporting: false } ),
	setResult: ( result: ImportResult | null ) => setSnapshot( { lastResult: result } ),
	openResults: () => setSnapshot( { isResultsOpen: true } ),
	closeResults: () => setSnapshot( { isResultsOpen: false } ),
	getSnapshot: () => snapshot,
	subscribe: ( listener: Listener ) => {
		listeners.add( listener );
		return () => {
			listeners.delete( listener );
		};
	},
};
