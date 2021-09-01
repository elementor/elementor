import { Before } from 'elementor-api/modules/hooks/ui';

export class BaseLoaderShow extends Before {
	apply() {
		jQuery( '#elementor-preview-loading' ).show();
	}
}
