export default class HistoryHelper {
	static undoValidate( assert, historyItem ) {
		$e.run( 'document/history/undo' );

		// History status changed.
		assert.equal( historyItem.status, 'applied',
			'After undo, history Item status is applied.' );
	}

	static redoValidate( assert, historyItem ) {
		$e.run( 'document/history/redo' );

		// History status changed.
		assert.equal( historyItem.status, 'not_applied',
			'After redo, history Item status is not_applied.' );
	}

	static inHistoryValidate( assert, historyItem, type, title ) {
		// Exist in history.
		assert.equal( historyItem.type, type, `History Item type is '${ type }'.` );
		assert.equal( historyItem.title, title, `History Item title is '${ title }'.` );
	}

	static destroyedValidate( assert, eController ) {
		assert.equal( eController.view.isDestroyed, true, 'Element has been destroyed.' );
		assert.equal( jQuery( document ).find( eController.view.$el ).length, 0,
			'Element has been removed from DOM.' );
	}

	static recreatedValidate( assert, eController ) {
		const eControllerLookedUp = eController.lookup();

		assert.notEqual( eControllerLookedUp.view.cid, eController.view.cid,
			'Element was recreated and not a reference to the old one.' );
		assert.equal( eControllerLookedUp.id, eController.id,
			'Element was re-added to DOM.' );
		assert.equal( eControllerLookedUp.view._index, eController.view._index,
			'Element was re-added to correct position.' );
	}

	static resetItems() {
		elementor.documents.getCurrent().history.getItems().reset();
	}

	static getFirstItem() {
		return elementor.documents.getCurrent().history.getItems().at( 0 );
	}

	static printHumanReadable() {
		// eslint-disable-next-line no-console
		console.log( '--------------------------------------------------------------' );

		Object.entries( elementor.history.history.getItems().models ).forEach( ( model ) => {
			const modelItem = model[ 1 ],
				modelAttribute = modelItem.attributes,
				subItemModels = modelAttribute.items.models;

			// eslint-disable-next-line no-console
			console.log( `History item #${ model[ 0 ] }: type: '${ modelAttribute.type }', title: ${ modelAttribute.title } ->` );

			subItemModels.forEach( ( subItemModel ) => {
				const subModelAttribute = subItemModel.attributes;

				// eslint-disable-next-line no-console
				console.log( `\t SubItem: type: '${ subModelAttribute.type }', title: ${ subModelAttribute.title }` );

				if ( subModelAttribute.data ) {
					// eslint-disable-next-line no-console
					console.log( '\t\t data', ( subModelAttribute.data.changes ) );
				}

				if ( subModelAttribute.options ) {
					// eslint-disable-next-line no-console
					console.log( '\t\t options', ( subModelAttribute.options ) );
				}
			} );
		} );

		// eslint-disable-next-line no-console
		console.log( '--------------------------------------------------------------' );
	}
}
