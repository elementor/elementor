import SiteEditorPromotion from './pages/promotion';

export default class SiteEditor {
	constructor() {
		elementorAppLoader.addRoute( {
			path: '/site-editor/promotion',
			component: SiteEditorPromotion,
		} );
	}
}
