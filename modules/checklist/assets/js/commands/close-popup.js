export class ClosePopup extends $e.modules.CommandBase {
	static rootElement = document.body.querySelector( '#e-checklist' );
	static isOpen = true;

	apply(args) {
		if ( ClosePopup.isOpen ) {
			this.unmount();
		}
	}

	unmount() {
		ClosePopup.rootElement.unmount();
		document.body.removeChild( document.body.querySelector( '#e-checklist' ) );
	}

}

export default ClosePopup;
