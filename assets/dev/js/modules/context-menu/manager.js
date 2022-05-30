
class ContextMenuManager {
	customGroups = {};

	filterGroupsByType( customGroups, contextType ) {
		const filteredCustomGroups = {};
		let authorizedTypes = [];

		for ( const customGroupsKey in customGroups ) {
			authorizedTypes = customGroups[ customGroupsKey ].includeInTypes;

			if ( ( 0 === authorizedTypes.length ) || authorizedTypes.includes( contextType ) ) {
				filteredCustomGroups[ customGroupsKey ] = customGroups[ customGroupsKey ];
			}
		}

		return filteredCustomGroups;
	}

	trigger( contextGroupsStart, contextGroupsEnd, contextType ) {
		const groupsFullList = {
			...contextGroupsStart,
			...this.filterGroupsByType( this.customGroups, contextType ),
			...contextGroupsEnd,
		};

		// trigger redux & send groupsFullList
	}

	createGroup( groupId, groupData ) {
		if ( this.customGroups.hasOwnProperty( groupId ) ) {
			return;
		}

		groupData.items = {};
		this.customGroups[ groupId ] = groupData;
	}

	updateGroup( groupId, groupData ) {
		if ( ! this.customGroups.hasOwnProperty( groupId ) ) {
			return;
		}

		this.customGroups[ groupId ] = { ...this.customGroups[ groupId ], ...groupData };
	}

	deleteGroup( groupId ) {
		delete this.customGroups[ groupId ];
	}

	addItem( groupId, itemId, newItem ) {
		if ( ! this.customGroups.hasOwnProperty( groupId ) || this.customGroups[ groupId ].items.hasOwnProperty( itemId ) ) {
			return;
		}

		this.customGroups[ groupId ].items[ itemId ] = newItem;
	}

	updateItem( groupId, itemId, itemData ) {
		if ( ! this.customGroups.hasOwnProperty( groupId ) || ! this.customGroups[ groupId ].items.hasOwnProperty( itemId ) ) {
			return;
		}

		this.customGroups[ groupId ].items[ itemId ] = { ...this.customGroups[ groupId ].items[ itemId ], ...itemData };
	}

	deleteItem( groupId, itemId ) {
		delete this.customGroups[ groupId ].items[ itemId ];
	}
}

elementor.contextMenu.createGroup(
	'groupId', 								// <string> Required, must be unique name, used to find the group.
	{										// <object> Required.
		title: '', 									// <string> If exists, displayed as a group title without action to trigger.
		priority: 0,								// <number> Sets the location of current group among other groups.
		disabled: false,							// <function | boolean> Displayed but disabled, if false.
		displayed: true,							// <function | boolean> Not displayed, if false.
		includeInTypes: [],							// <string[]> Array of elements (section/column/widget...) that this group is displayed on.
		parentItemId: '',							// <string> the name of the parent item, if current group in a child of an item (used for nested menu).
	}
);

elementor.contextMenu.addItem(
	'groupId', 										// <string> Required, the name of an existing group to add items to.
	'itemId', 										// <string> Required, must be unique name, used to find the item.
	{												// <object> Required.
		label: '',									// <string> Required, describes the action.
		icon: '',									// <function | string> Can be a callback for checkbox 'checked' effect.
		shortKey: '',								// <string>.
		priority: 0,								// <number> Sets the location of current item inside current group.
		disabled: false,							// <function | boolean> Displayed but disabled, if false.
		displayed: true,							// <function | boolean> Not displayed, if false.
		action: null,								// <function> Callback to be triggered on-click.
		mouseEnter: null,							// <function> Callback to be triggered on-mouse-enter.
		mouseLeave: null,							// <function> Callback to be triggered on-mouse-leave.
	},
);

elementor.contextMenu.updateGroup(
	'groupId', 								// <string> Required, the name of the group to edit.
	{ title: 'Some title', priority: 7 }	// <object> Required, list of the group properties and their values to be updated.
);

elementor.contextMenu.updateItem(
	'groupId', 								// <string> Required, the name of the group where the item belongs.
	'itemId', 								// <string> Required, the name of the item to edit.
	{ label: 'Describe item action' },		// <object> Required, list of the item properties and their values to be updated.
);

elementor.contextMenu.deleteGroup(
	'groupId', 								// <string> Required, the name of the group to delete.
);

elementor.contextMenu.deleteItem(
	'groupId', 										// <string> Required, the name of the group where the item belongs.
	'itemId', 										// <string> Required, the name of the item to delete.
);
