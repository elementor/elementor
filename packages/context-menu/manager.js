
export class ContextMenuManager {
	groups = [];

	allowedProperties = {
		group: [ 'id', 'title', 'disabled', 'parentItemId' ],
		item: [ 'id', 'label', 'icon', 'shortcut', 'badge', 'action', 'mouseEnter', 'mouseLeave' ],
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
		mouseEnter: null,
		mouseLeave: null,
		groups: [],
	};

	getConfig() {
		return this.createGroupsTree();
	}

	createGroupsTree( parentItemId = '' ) {
		const rootGroups = this.groups.filter( ( group ) => group.parentItemId === parentItemId );
		return rootGroups.map( ( rootGroup ) => {
			rootGroup.items = rootGroup.items.map( ( item ) => {
				item.groups = this.createGroupsTree( item.id );
				return item;
			} );
			return rootGroup;
		} );
	}

	validateProperties( allowed, newObject ) {
		const result = {};

		Object.entries( newObject ).forEach( ( [ key ] ) => {
			if ( allowed.includes( key ) ) {
				result[ key ] = newObject[ key ];
			}
		} );

		return result;
	}

	createGroup( newGroup ) {
		if ( ! newGroup.id || this.groups.find( ( group ) => group.id === newGroup.id ) ) {
			return;
		}

		newGroup = this.validateProperties( this.allowedProperties.group, newGroup );

		this.groups.push( { ...structuredClone( this.groupDefault ), ...newGroup } );
	}

	updateGroup( groupId, groupData ) {
		groupData = this.validateProperties( this.allowedProperties.group, groupData );
		this.updateGroupData( groupId, groupData );
	}

	updateGroupData( groupId, groupData ) {
		const groupIndex = this.groups.findIndex( ( group ) => group.id === groupId );

		if ( ! this.groups[ groupIndex ] ) {
			return;
		}

		this.groups[ groupIndex ] = { ...this.groups[ groupIndex ], ...groupData };
	}

	deleteGroup( groupId ) {
		this.groups = this.groups.filter( ( group ) => group.id !== groupId );
	}

	addItem( groupId, newItem ) {
		const groupIndex = this.groups.findIndex( ( group ) => group.id === groupId );
		if ( ! newItem.id || ! this.groups[ groupIndex ] || this.groups[ groupIndex ].items.find( ( item ) => item.id === newItem.id ) ) {
			return;
		}

		newItem = this.validateProperties( this.allowedProperties.item, newItem );

		this.groups[ groupIndex ].items.push( { ...structuredClone( this.itemDefault ), ...newItem } );
	}

	updateItem( groupId, itemId, itemData ) {
		const currentGroup = this.groups.find( ( group ) => group.id === groupId );

		if ( ! currentGroup ) {
			return;
		}

		const itemIndex = currentGroup.items.findIndex( ( item ) => item.id === itemId );

		if ( ! currentGroup.items[ itemIndex ] ) {
			return;
		}

		itemData = this.validateProperties( this.allowedProperties.item, itemData );
		currentGroup.items[ itemIndex ] = { ...currentGroup.items[ itemIndex ], ...itemData };
		this.updateGroupData( groupId, currentGroup );
	}

	deleteItem( groupId, itemId ) {
		const currentGroup = this.groups.find( ( group ) => group.id === groupId );

		if ( ! currentGroup ) {
			return;
		}

		currentGroup.items = currentGroup.items.filter( ( item ) => item.id !== itemId );
		this.updateGroupData( groupId, currentGroup );
	}
}

