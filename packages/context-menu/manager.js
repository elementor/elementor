
export class ContextMenuManager {
	groups = [];

	getConfig( dimensions ) {
		return {
			dimensions,
			groupsTree: this.createGroupsTree(),
		};
	}

	createGroupsTree( parentItemId = '' ) {
		const rootGroups = this.groups.filter( ( group ) => group.parentItemId === parentItemId );
		return rootGroups.map( ( rGroup ) => {
			rGroup.items = rGroup.items.map( ( item ) => {
				item.groups = this.createGroupsTree( item.id );
				return item;
			} );
			return rGroup;
		} );
	}

	createGroup( groupData ) {
		if ( this.groups.find( ( group ) => group.id === groupData.id ) ) {
			return;
		}

		groupData.items = [];
		if ( ! groupData.parentItemId ) {
			groupData.parentItemId = '';
		}

		this.groups.push( groupData );
	}

	updateGroup( groupId, groupData ) {
		this.groups = this.groups.map( ( group ) => {
			if ( group.id === groupId ) {
				return { ...group, ...groupData };
			}
			return group;
		} );
	}

	deleteGroup( groupId ) {
		this.groups = this.groups.filter( ( group ) => group.id !== groupId );
	}

	addItem( groupId, newItem ) {
		const groupIndex = this.groups.findIndex( ( group ) => group.id === groupId );
		if ( ! this.groups[ groupIndex ] || this.groups[ groupIndex ].items.find( ( item ) => item.id === newItem.id ) ) {
			return;
		}

		this.groups[ groupIndex ].items.push( newItem );
	}

	updateItem( groupId, itemId, itemData ) {
		this.groups = this.groups.map( ( group ) => {
			if ( group.id === groupId ) {
				group.items = group.items.map( ( item ) => {
					if ( item.id === itemId ) {
						return { ...item, ...itemData };
					}
					return item;
				} );
			}
			return group;
		} );
	}

	deleteItem( groupId, itemId ) {
		this.groups = this.groups.map( ( group ) => {
			if ( group.id === groupId ) {
				group.items = group.items.filter( ( item ) => item.id !== itemId );
			}
			return group;
		} );
	}
}
