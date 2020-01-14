import Base from './base/base';

export class Discard extends Base {
	apply() {
		return elementorCommon.ajax.addRequest( 'discard_changes', {
			success: () => {

				elementor.saver.setFlagEditorChange( false );
			},
		} );
	}
}

export default Discard;
