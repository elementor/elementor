type Snapshot = {
	isOpen: boolean;
	isImporting: boolean;
};

type Listener = () => void;

const listeners = new Set< Listener >();

let snapshot: Snapshot = {
	isOpen: false,
	isImporting: false,
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
	getSnapshot: () => snapshot,
	subscribe: ( listener: Listener ) => {
		listeners.add( listener );
		return () => {
			listeners.delete( listener );
		};
	},
};
