import Base from './base/base';

export class Discard extends Base {
	apply() {
		elementorCommon.ajax.addRequest( 'discard_changes', {
			success: function() {
				$e.run( 'document/saver', { status: false } );
				location.href = elementor.config.document.urls.exit_to_dashboard;
			},
		} );
	}
}

export default Discard;
