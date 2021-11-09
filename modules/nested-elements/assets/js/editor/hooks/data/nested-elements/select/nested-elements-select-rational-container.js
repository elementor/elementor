
export class NestedElementsSelectRationalContainer extends $e.modules.hookData.After {
	getId() {
		return 'nested-elements-select-rational-container';
	}

	getCommand() {
		return 'nested-elements/select';
	}

	apply( args ) {
		const selectContainer = args.container.children[ args.index - 1 ];

		$e.run( 'panel/editor/open', {
			model: selectContainer.model,
			view: selectContainer.view,
			container: selectContainer,
		} );
	}
}

export default NestedElementsSelectRationalContainer;
