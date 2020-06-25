import { After } from "elementor-api/modules/hooks/ui";

export class CaptureScreenshot extends After {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'capture-screenshot';
	}

	getConditions( args = {}, result ) {
		return args.status === 'publish';
	}

	apply( args ) {
		$e.internal( 'screenshots/capture' );
	}
}
