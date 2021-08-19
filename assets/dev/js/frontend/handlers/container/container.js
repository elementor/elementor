export default [
	() => import( /* webpackChunkName: 'container' */ '../background-slideshow' ),
	() => import( /* webpackChunkName: 'container' */ '../background-video' ),
	() => import( /* webpackChunkName: 'container' */ './handles-position' ),
	// TODO: Move to a global handler for all widgets.
	() => {
		if ( elementorFrontend.isEditMode() ) {
			return import( /* webpackChunkName: 'container' */ '../floating-bar' );
		}
	},
];
