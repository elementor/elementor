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
		$e.run(
			'document/elements/select',
			{ container: elementor?.documents?.currentDocument?.container?.children[ 0 ], append: false },
		);
	}
}

export default SelectLoadingButtonOnOpen;
