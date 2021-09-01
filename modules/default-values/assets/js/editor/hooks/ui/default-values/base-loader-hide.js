import { After } from 'elementor-api/modules/hooks/ui';

export class BaseLoaderHide extends After {
	timeout = 600;

	apply() {
		jQuery( '#elementor-preview-loading' ).fadeOut( this.timeout );
	}
}
