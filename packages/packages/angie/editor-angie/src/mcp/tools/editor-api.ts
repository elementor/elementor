export type ElementorCommands = {
	run?: ( command: string, args?: Record< string, unknown > ) => Promise< unknown > | unknown;
};

export type SettingsWritableContainer = {
	settings?: {
		get?: ( controlName: string ) => unknown;
	};
};

export const getCommands = (): ElementorCommands | undefined => ( window as unknown as { $e?: ElementorCommands } ).$e;

export const requireCommandsRun = () => {
	const run = getCommands()?.run;

	if ( ! run ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	return run;
};

export const applyDocumentElementSettings = async (
	container: SettingsWritableContainer,
	settings: Record< string, unknown >
) => {
	const run = requireCommandsRun();

	await run( 'document/elements/settings', {
		container,
		settings,
		options: {
			external: true,
		},
	} );
};
