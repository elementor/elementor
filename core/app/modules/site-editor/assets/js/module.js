import router from '@elementor/router';
import SiteEditorPromotion from './pages/promotion';

export default class SiteEditor {
	constructor() {
		router.addRoute( {
			path: '/site-editor/promotion',
			component: SiteEditorPromotion,
		} );
	}
}
