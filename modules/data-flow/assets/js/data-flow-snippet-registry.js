export function createSnippetRegistry() {
	const snippets = new Map();
	const listeners = new Set();

	return {
		registerSnippet: ( name, handlers ) => {
			snippets.set( name, handlers );
			listeners.forEach( ( listener ) => listener( name ) );
		},
		getHandler: ( name, event ) => snippets.get( name )?.[ event ],
		onRegister: ( listener ) => {
			listeners.add( listener );

			return () => listeners.delete( listener );
		},
	};
}
