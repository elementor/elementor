import Dependency from 'elementor-api/modules/hooks/data/dependency';

export class LinkInLinkMove extends Dependency {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'link-in-link-restriction-move';
	}

	apply( args ) {
		const { containers = [ args.container ], target } = args;
		const sourceElements = containers;
		const targetElement = target;

		const hasChildWithAnchor = sourceElements.some( ( src ) =>
			elementor.helpers.findChildWithAnchor( src.view.el ),
		);

		return ! ( hasChildWithAnchor && elementor.helpers.findParentWithAnchor( targetElement.view.el ) );
	}
}

export default LinkInLinkMove;
