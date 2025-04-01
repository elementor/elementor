import Dependency from 'elementor-api/modules/hooks/data/dependency';

export class LinkInLinkPaste extends Dependency {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'link-in-link-restriction-paste';
	}

	apply( args ) {
		const { containers = [ args.container ], storageKey } = args;
		const targetElements = containers;
		const data = elementorCommon.storage.get( storageKey );
		const sourceElements = data.clipboard.elements;

		const hasChildWithAnchor = sourceElements.some( ( src ) =>
			src.htmlCache.indexOf( '<a' ) !== -1,
		);

		if ( ! hasChildWithAnchor ) {
			return true;
		}

		const hasParentWithAnchor = targetElements.some( ( target ) =>
			elementor.helpers.findParentWithAnchor( target.view.el ),
		);
		return ! hasParentWithAnchor;
	}
}

export default LinkInLinkPaste;
