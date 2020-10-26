import CommandBase from 'elementor-api/modules/command-base';

/**
 * @property {RevisionsComponent} component
 */
export class Discard extends CommandBase {
	apply() {
		const document = this.component.currentDocument;

		if ( document.config.panel.has_elements ) {
			document.revisions.setEditorData( elementor.config.document.elements );
		}

		$e.internal( 'document/save/set-is-modified', { status: this.component.isRevisionApplied } );

		this.component.isRevisionApplied = false;

		this.component.currentPreviewId = null;

		this.component.tab.exitReviewMode();
	}
}

export default Discard;
