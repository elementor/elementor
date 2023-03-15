export class Close extends $e.modules.CommandBase {
	apply() {
		if ( ! this.component.close() ) {
			return false;
		}

		this.component.iframe.remove();
		this.component.iframe = null;

		return true;
	}
}

export default Close;
