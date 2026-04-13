export class AddBaseClass extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'atomic-widgets-add-base-class';
	}

	apply() {
		const document = elementor.documents.getCurrent();
		const config = document?.config;
		
		if ( ! config?.panel?.atomic ) {
			return;
		}

		const documentType = config.type;
		const baseClass = `e-document-${ documentType }-base`;
		
		const iframe = window.document.querySelector( '#elementor-preview-iframe' );
		const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
		
		if ( ! iframeDoc ) {
			return;
		}

		const docElement = iframeDoc.querySelector( `[data-elementor-id="${ config.id }"]` );
		
		if ( docElement && ! docElement.classList.contains( baseClass ) ) {
			docElement.classList.add( baseClass );
		}
	}
}

export default AddBaseClass;
