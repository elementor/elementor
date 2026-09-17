module.exports = class FooterSaver {
	previewWindow = null;

	refreshWpPreview() {
		if ( ! this.previewWindow ) {
			return;
		}

		try {
			this.previewWindow.location.href = elementor.config.document.urls.wp_preview;
		} catch ( e ) {
			// If the previewWindow is closed or its domain was changed.
		}
	}
};
