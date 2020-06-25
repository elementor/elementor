import {After} from "elementor-api/modules/hooks/ui";

export class CaptureScreenshot extends After {
	getCommand() {
		return 'document/save/publish';
	}

	getId() {
		return 'capture-screenshot';
	}

	apply(args) {
		$e.internal( 'screenshots/capture' );
	}
}
