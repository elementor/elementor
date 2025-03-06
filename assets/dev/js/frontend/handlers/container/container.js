import { createEditorHandler } from '../create-editor-handler';

export default [
	() => import( /* webpackChunkName: 'shared-frontend-handlers' */ '../background-slideshow' ),
	() => import( /* webpackChunkName: 'shared-frontend-handlers' */ '../background-video' ),

	createEditorHandler( () => import( /* webpackChunkName: 'shared-editor-handlers' */ '../handles-position' ) ),
	createEditorHandler( () => import( /* webpackChunkName: 'container-editor-handlers' */ './shapes' ) ),
	createEditorHandler( () => import( /* webpackChunkName: 'container-editor-handlers' */ './grid-container' ) ),
];
