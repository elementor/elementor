declare global {
	interface Window {
		Marionette: {
			CompositeView: {
				extend: ( options: { template: string } ) => unknown;
			};
		};
	}
}

export function createNoticeView() {
	// eslint-disable-next-line no-console
	console.log( '[notice] createNoticeView() called' );

	return window.Marionette.CompositeView.extend( {
		template: `<div></div>`,

		onRender() {
			// eslint-disable-next-line no-console
			console.log( '[notice] Marionette notice view rendered, el:', this.el );
		},
	} );
}
