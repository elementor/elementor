export default [
	() => new Promise( ( resolve, reject ) => {
		if ( elementorFrontend.isEditMode() ) {
			resolve( import( /* webpackChunkName: 'container' */ '../handles-position' ) );
		} else {
			reject();
		}
	} ),
	() => import( /* webpackChunkName: 'container' */ './shapes' ),
	() => import( /* webpackChunkName: 'container' */ './grid-container' ),
];
