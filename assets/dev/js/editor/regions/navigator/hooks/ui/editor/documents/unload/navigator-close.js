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
		$e.run( 'navigator/close' );
	}
}

export default NavigatorClose;
