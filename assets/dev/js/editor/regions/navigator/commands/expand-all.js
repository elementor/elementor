export class ExpandAll extends $e.modules.CommandBase {
	apply() {
		if ( this.component.isOpen ) {
			this.expandAllElements();
		} else {
			this.openNavigator();
		}
	}

	openNavigator() {
		$e.run( 'navigator/open', { expandAllElements: true } );
	}

	expandAllElements() {
		this.component.manager.currentView.elements.currentView.recursiveChildInvoke(
			'toggleList',
			true,
		);
	}
}

export default ExpandAll;
