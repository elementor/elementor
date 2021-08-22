export default [
	() => import( /* webpackChunkName: 'container' */ './handles-position' ),
	// TODO: Move to a global handler for all widgets.
	() => import( /* webpackChunkName: 'container' */ '../floating-bar' ),
];
