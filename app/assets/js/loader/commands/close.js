export class Close extends $e.modules.CommandBase {
	apply() {
		if ( ! this.component.close() ) {
			return false;
		}

		this.component.iframe.remove();
		this.component.iframe = null;

		if ( this.component.backdrop ) {
			this.component.backdrop.remove();
			this.component.backdrop = null;
		}

		return true;
	}
}

export default Close;
