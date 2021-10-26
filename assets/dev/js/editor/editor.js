import EditorBase from './editor-base';

export class Editor extends EditorBase {
	onStart( options ) {
		NProgress.start();
		NProgress.inc( 0.2 );

		super.onStart( options );
	}

	onPreviewLoaded() {
		NProgress.done();

		super.onPreviewLoaded();
	}

	/**
	 * Function loadModules().
	 *
	 * Dynamically inject modules.
	 * Some of the modules can be injected as promise of their import
	 *
	 * @returns {Promise<void>}
	 */
	async loadModules() {
		const modulesPromise = Object.entries( elementor.modules )
			.filter( ( [ , type ] ) => type instanceof Promise )
			.map( ( [ name, promise ] ) => {
				promise.name = name;
				return promise;
			} );

		// Await for all modules to load.
		await Promise.all( modulesPromise.map( async ( promise ) => {
			// Load the module.
			const Module = await promise;

			// Create new module instance
			this.modules[ promise.name ] = new Module.default();
		} ) );
	}

	async start( options ) {
		// Load modules first, then start editor.
		await this.loadModules();

		return super.start( options );
	}
}

window.elementor = new Editor();

elementorCommon.elements.$window.trigger( 'elementor:pre-start' );

elementor.start();
