import CommandBase from 'elementor-api/modules/command-base';

/**
 * @property {RevisionsComponent} component
 */
export class Apply extends CommandBase {
	apply() {
		$e.internal( 'document/save/set-is-modified', { status: true } );

		$e.run( 'document/save/auto', { force: true } );

		this.component.isRevisionApplied = true;

		this.component.currentPreviewId = null;

		this.component.currentDocument.history.getItems().reset();
	}
}

export default Apply;
