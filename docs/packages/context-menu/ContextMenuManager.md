# Context Menu Manager (API)

## Introduction:
The context menu manager provides a convenient way for managing the context menu structure.
The manager is responsible for building a tree of nested groups/items that forms the actual structure of the context menu, as presented in the UI.   
The manager is based on CRUD principles while providing simple functions for adding, updating, deleting & in the end - provides a function for reading the main tree that have been created.

### Context-Menu config structure:
The context menu config structure is built as a tree of groups & items.
The root is based on groups, each group contains one or more item (inside its `items[]` property).
Items can also have children, inside their `groups[]` property. those children are *nested groups*.

#### Structure tree:

```TS
interface Group {
	id: string; 						// Must be unique.
	title: string; 						// If exists, displayed as a group title without action to trigger.
	disabled: Function | boolean;		// If true, the entire group is Displayed but disabled.
	parentItemId: string;				// Id of the parent (a valid item id). if used - creates a nested menu.
	items: Item[]; 						// List of items.
};

interface Item {
	id: string;							// Must be unique.
	label: string;						// Describes the action.
	icon: Function | string;			// Can be a callback for checkbox effect.
	shortCut: string;					// ShortCut symbols. 
	badge: Badge;						// Creates a visual badge for special indications.
	disabled: Function | boolean;		// If true, displayed but disabled.
	action: Function;					// A callback to be triggered on-click.
	onMouseEnter: Function;				// A callback to be triggered on-mouse-enter.
	onMouseLeave: Function;				// A callback to be triggered on-mouse-leave.
	groups: Group[];					// List of groups (for nested menus).
};

interface Badge {
	backgroundColor: string; 			// Background color of the badge.
	color: string;						// Text color of the badge.
	text: string;						// Text of badge.
}

type Structure = Group[];
```


#### UI general notes:
> A group is not displayed (but its items are) unless it contains a *title*.

> Items of a group are displayed together, separated from other group items with a line separator.

> Nested groups are displayed as a sub-menu aside the main context-menu.

## API methods:
Each method has parameters explanation and attention notes if needed.

&nbsp;
### createGroup( newGroup )
Example:
```JS
createGroup(
 	{
 		id: '',				// Required.
 		title: '', 			// Optional, if not specified will be '' as default.
 		disabled: false,	// Optional, if not specified will be false as default.
 		parentItemId: '',	// Optional, if not specified will be '' as default.
 	}
 );
```
Notes:
> The group 'id' property must be unique. recommended using as: scopeNameOrFeatureName_someGroupActionName

> The parentItemId, if used, must point to an existing *item*, otherwise the group won't be displayed.

> The parentItemId, if used, cannot point to a children (or any descendant) of the current group.

&nbsp;
### updateGroup( groupId, groupData )
Example:
```JS
updateGroup(
	'groupId',					// Required.
 	{
		title: 'some title',	// One or more properties to be update.
 	}
 );
```
Notes:
> The groupId parameter must point to an existing group.

&nbsp;
### deleteGroup( groupId )
Example:
```JS
deleteGroup(
	'groupId',					// Required.
 );
```
Notes:
> The group will be deleted with all its descendants.


&nbsp;
### addItem( groupId, newItem )
Add an item to an existing group.

Example:
```JS
addItem(
    'groupId',
 	{
 		id: '',				// Required.
		label: '',			// Optional, if not specified will be '' as default.
		icon: null,			// Optional, if not specified will be null as default.
		shortcut: '',		// Optional, if not specified will be '' as default.
		badge: null,		// Optional, if not specified will be null as default.
		action: null,		// Optional, if not specified will be null as default.
		onMouseEnter: null,	// Optional, if not specified will be null as default.
		onMouseLeave: null,	// Optional, if not specified will be null as default.
 	}
 );
```
Notes:
> The groupId parameter must point to an existing group.

> The new item will reside inside its group parent 'items[]'. 

> The item 'id' property must be unique. recommended using as: nameOfGroup_itemAction.

>  The item 'label' property is important, it describes the items action.
 
> The item 'label' property can contain up to 30 chars max (or will be trimmed).

