import Base from './base/base';

export class Discard extends Base {
	apply() {
		return elementorCommon.ajax.addRequest( 'discard_changes', {
			success: () => {
				$e.internal( 'document/save/set-is-modified', { status: false } );
				location.href = elementor.config.document.urls.exit_to_dashboard;
			},
		} );
	}
}

export default Discard;
