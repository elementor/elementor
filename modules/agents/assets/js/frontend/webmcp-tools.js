import { getModelContext } from './model-context';

const toTextResult = ( text, isError ) => ( {
	content: [ { type: 'text', text } ],
	isError,
} );

export const runTool = async ( runUrl, name, input ) => {
	try {
		const response = await fetch( runUrl, {
			method: 'POST',
			credentials: 'omit',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { tool: name, input } ),
		} );

		const payload = await response.json();

		return toTextResult( JSON.stringify( payload ), ! response.ok );
	} catch ( error ) {
		return toTextResult( `Tool "${ name }" failed: ${ error.message }`, true );
	}
};

export const registerTools = ( modelContext, config ) => {
	if ( ! modelContext?.registerTool || ! Array.isArray( config?.tools ) ) {
		return;
	}

	for ( const { name, description, inputSchema } of config.tools ) {
		try {
			modelContext.registerTool( {
				name,
				description,
				inputSchema,
				annotations: { readOnlyHint: true },
				execute: ( input ) => runTool( config.runUrl, name, input ),
			} );
		} catch {
			// A tool that the browser rejects (e.g. a duplicate name) must not block the others.
		}
	}
};

registerTools( getModelContext( window.document, window.navigator ), window.elementorAgentsWebmcpConfig );
