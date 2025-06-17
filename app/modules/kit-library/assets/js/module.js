import KitsComponent from './data/kits/component';
import router from '@elementor/router';
import TaxonomiesComponent from './data/taxonomies/component';
import KitLibraryComponent from './e-component';
import CloudKitsComponent from './data/cloud-kits/component';

export default class KitLibrary {
	constructor() {
		if ( ! this.hasAccessToModule() ) {
			return;
		}

		$e.components.register( new KitsComponent() );
		$e.components.register( new TaxonomiesComponent() );
		$e.components.register( new KitLibraryComponent() );
		$e.components.register( new CloudKitsComponent() );

		router.addRoute( {
			path: '/kit-library/*',
			component: React.lazy( () => import( /* webpackChunkName: 'kit-library' */ './app' ) ),
		} );
	}

	hasAccessToModule() {
		return elementorAppConfig[ 'kit-library' ]?.has_access_to_module;
	}
}
