import { createEditorHandler } from '../create-editor-handler';

export default [
	() => import( /* webpackChunkName: 'section-frontend-handlers' */ './stretched-section' ), // Must run before BackgroundSlideshow to init the slideshow only after the stretch.
	() => import( /* webpackChunkName: 'shared-frontend-handlers' */ '../background-slideshow' ),
	() => import( /* webpackChunkName: 'shared-frontend-handlers' */ '../background-video' ),

	createEditorHandler( () => import( /* webpackChunkName: 'shared-editor-handlers' */ '../handles-position' ) ),
	createEditorHandler( () => import( /* webpackChunkName: 'section-editor-handlers' */ './shapes' ) ),
];

