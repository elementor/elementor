export class ContextMenuManager {
	groups = [];

	allowedProperties = {
		group: [ 'id', 'title', 'disabled', 'parentItemId' ],
		item: [ 'id', 'label', 'icon', 'shortcut', 'badge', 'action', 'onMouseEnter', 'onMouseLeave' ],
	};

	groupDefault = {
		id: '',
		title: '',
		disabled: false,
		parentItemId: '',
		items: [],
	};

	itemDefault = {
		id: '',
		label: '',
		icon: false,
		shortcut: '',
		badge: null,
		action: null,
		onMouseEnter: null,
		onMouseLeave: null,
		groups: [],
	};

	getGroup( groupId ) {
		return this.groups.find( ( group ) => group.id === groupId );
	}

	groupExists( groupId ) {
		return !! this.getGroup( groupId );
	}

	getItem( groupId, itemId ) {
		const currentGroup = this.getGroup( groupId );
		return currentGroup.items.find( ( item ) => item.id === itemId );
	}

	itemExists( groupId, itemId ) {
		return !! this.getItem( groupId, itemId );
	}

	updateGroupData( groupId, groupData ) {
		const groupIndex = this.groups.findIndex( ( group ) => group.id === groupId );

		if ( ! this.groups[ groupIndex ] ) {
			return;
		}

		this.groups[ groupIndex ] = { ...this.groups[ groupIndex ], ...groupData };
	}

	createGroupsTree( parentItemId = '' ) {
		return this.groups
			.filter( ( group ) => group.parentItemId === parentItemId )
			.map( ( rootGroup ) => {
				rootGroup.items = rootGroup.items.map( ( item ) => {
					item.groups = this.createGroupsTree( item.id );

					return item;
				} );

				return rootGroup;
		} );
	}

	sanitizeProperties( allowed, newObject ) {
		return Object.fromEntries(
			Object.entries( newObject )
				.filter( ( [ key ] ) => allowed.includes( key ) )
		);
	}

	getConfig() {
		return this.createGroupsTree();
	}

	createGroup( newGroup ) {
		if ( ! newGroup.id || this.groupExists( newGroup.id ) ) {
			return;
		}

		this.groups.push( {
			...structuredClone( this.groupDefault ),
			...this.sanitizeProperties( this.allowedProperties.group, newGroup ),
		} );
	}

	updateGroup( groupId, groupData ) {
		this.updateGroupData( groupId, this.sanitizeProperties( this.allowedProperties.group, groupData ) );
	}

	deleteGroup( groupId ) {
		this.groups = this.groups.filter( ( group ) => group.id !== groupId );
	}

	addItem( groupId, newItem ) {
		if ( ! newItem.id ) {
			return;
		}

		const groupIndex = this.groups.findIndex( ( group ) => group.id === groupId );
		if ( ! this.groups[ groupIndex ] || this.itemExists( groupId, newItem.id ) ) {
			return;
		}

		this.groups[ groupIndex ].items.push( {
			...structuredClone( this.itemDefault ),
			...this.sanitizeProperties( this.allowedProperties.item, newItem ),
		} );
	}

	updateItem( groupId, itemId, itemData ) {
		const currentGroup = this.getGroup( groupId );

		if ( ! currentGroup ) {
			return;
		}

		const itemIndex = currentGroup.items.findIndex( ( item ) => item.id === itemId );

		if ( ! currentGroup.items[ itemIndex ] ) {
			return;
		}

		itemData = this.sanitizeProperties( this.allowedProperties.item, itemData );
		currentGroup.items[ itemIndex ] = { ...currentGroup.items[ itemIndex ], ...itemData };
		this.updateGroupData( groupId, currentGroup );
	}

	deleteItem( groupId, itemId ) {
		const currentGroup = this.getGroup( groupId );

		if ( ! currentGroup ) {
			return;
		}

		currentGroup.items = currentGroup.items.filter( ( item ) => item.id !== itemId );
		this.updateGroupData( groupId, currentGroup );
	}
}

