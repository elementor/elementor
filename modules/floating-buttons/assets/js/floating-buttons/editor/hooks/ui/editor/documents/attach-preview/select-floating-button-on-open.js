export class SelectLoadingButtonOnOpen extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/attach-preview';
	}

	getId() {
		return 'elementor-floating-buttons-select-on-open';
	}

	getConditions( ) {
		return 'floating-buttons' === elementor?.config?.document?.type;
	}

	apply() {
		const children = elementor?.documents?.currentDocument?.container?.children;

		if ( Array.isArray( children ) && children.length ) {
			$e.run(
				'document/elements/select',
				{ container: children[ 0 ], append: false },
			);
		} else {
			$e.run( 'library/open' );
		}
	}
}

export default SelectLoadingButtonOnOpen;
