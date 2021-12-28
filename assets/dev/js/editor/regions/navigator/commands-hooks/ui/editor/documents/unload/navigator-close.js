import After from 'elementor-api/modules/hooks/ui/after';

export class NavigatorClose extends After {
	getCommand() {
		return 'editor/documents/unload';
	}

	getId() {
		return 'navigator-close';
	}

	getConditions() {
		return $e.components.get( 'navigator' ).isOpen;
	}

	apply() {
		// Calling directly to component close will no effect the navigator storage, the navigator will be opened again after reload.
		$e.components.get( 'navigator' ).close();
	}
}

export default NavigatorClose;
