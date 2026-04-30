// TEMP: tracks whether an import is currently running so the trigger button can disable itself
// and the "Try again" notification action can guard against re-entrancy. Once the import API is
// in place, this should be derived from the request lifecycle and removed.
type Listener = () => void;

const listeners = new Set< Listener >();
let isImporting = false;

const notify = () => listeners.forEach( ( listener ) => listener() );

export const importStatus = {
	markImporting: () => {
		isImporting = true;
		notify();
	},
	markIdle: () => {
		isImporting = false;
		notify();
	},
	getSnapshot: () => isImporting,
	subscribe: ( listener: Listener ) => {
		listeners.add( listener );
		return () => {
			listeners.delete( listener );
		};
	},
};
