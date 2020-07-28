import { After } from 'elementor-api/modules/hooks/ui';

export class CaptureScreenshot extends After {
	getCommand() {
		// Using document/save/save and not document/save/publish.
		// when updating a document it does not trigger document/save/publish
		// although it actually publish the document.
		return 'document/save/save';
	}

	getId() {
		return 'capture-screenshot';
	}

	getConditions( args = {} ) {
		return 'publish' === args.status;
	}

	apply() {
		$e.internal( 'screenshots/capture' );
	}
}
