/**
 * Each time you request to edit any element, if the path contains nested-widget then set the pate into the URL HASH.
 */
export class NestedRepeaterUpdatePathHashTag extends $e.modules.hookUI.After {
	getCommand() {
		return 'panel/editor/open';
	}

	getId() {
		return 'nested-repeater-update-path-hash-tag';
	}

	getConditions( args ) {
		// If the target container ancestry have any nested widget.
		return args.view.container.getParentAncestry().some(
			( container ) => container.model.get( 'elType' )
		);
	}

	apply( args ) {
		// Update location path according to navigation path.
		location.hash = `e:run:panel/editor/open?{ "id": "${ args.view.container.id }" }`;
	}
}

export default NestedRepeaterUpdatePathHashTag;
