# Context Menu Manager (API)

## Table of contents
- [Introduction](#introduction)
    - [Context menu UI behavior](#context-menu-ui-behavior)
    - [Context-Menu config structure](#context-menu-config-structure)
    - [Structure tree](#structure-tree)
- [API methods](#api-methods)
  - [Create a group](#create-a-group)
  - [Update a group](#update-a-group)
  - [Delete a group](#delete-a-group)
  - [Add item](#add-item)
  - [Update item](#update-item)
  - [Delete item](#delete-item)
  - [Get config](#get-config)
- [Understanding the usage flow](#understanding-the-usage-flow)
  - [Registration of new items](#registration-of-new-items)
  - [Triggering the context menu flow](#triggering-the-context-menu-flow)
- [Example of usage](#example-of-usage)

## Introduction
The context menu manager provides a convenient way for managing the context menu structure.
The manager is responsible for building a tree of nested groups/items that forms the actual structure of the context menu, as presented in the UI.   
The manager is based on CRUD principles and provides simple methods for adding, updating & deleting items, as well as retrieving them as a tree.

### Context menu UI behavior
For a better understanding of the structure and the manager, let's see some important UI notes:

* The context menu displays a list of items that support `onClick` & `onMouseEnter` callbacks.

* If an item contains children groups, hovering on it will open a sub menu, and clicking on it won't trigger action.

* Groups themselves are not visually displayed, they just displays their items and separate between them.

* A group can display a title, if a title is specified.

* Items of a group are displayed together, separated from other group items with a line separator.

* Nested groups are displayed as a sub-menu aside the main context-menu.

### Context Menu config structure
The context menu config structure is built as a tree of groups & items.
The root is based on groups, each group contains one or more items (inside its `items` property).
Items can also have children, inside their `groups` property. those children are *nested groups*.

### Structure tree

```TS
interface Group {
	id: string; 				// Must be unique.
	title: string;				// If exists, displayed as a group title without action to trigger.
	disabled: Function | boolean;		// If true, the entire group is displayed but disabled.
	parentItemId: string;			// Id of the parent (a valid item id). if used - creates a nested menu.
	items: Item[]; 				// List of items.
};

interface Item {
	id: string;				// Must be unique.
	label: string;				// Describes the action.
	icon: string;				// An icon string.
	shortcut: string;			// Shortcut symbols. 
	badge: Badge;				// Creates a visual badge for special indications.
	disabled: Function | boolean;		// If true, displayed but disabled.
	action: Function;			// A callback to be triggered on-click.
	onMouseEnter: Function;			// A callback to be triggered on-mouse-enter.
	onMouseLeave: Function;			// A callback to be triggered on-mouse-leave.
	groups: Group[];			// List of groups (for nested menus).
};

interface Badge {
	backgroundColor: string;		// Background color of the badge.
	color: string;				// Text color of the badge.
	text: string;				// Text of badge.
}

type Structure = Group[];
```


&nbsp;  
## API methods
Each method has parameters explanation and attention notes if needed.

&nbsp;
### Create a group
`createGroup( newGroup )` - Create a group and add it to the config tree. 

&nbsp;  
Example:
```JS
createGroup(
 	{
 		id: '',			// Required.
 		title: '', 		// Optional, if not specified will be '' as default.
 		disabled: false,	// Optional, if not specified will be false as default.
 		parentItemId: '',	// Optional, if not specified will be '' as default.
 	}
 );
```

&nbsp;  
Notes:
> The group 'id' property must be unique. recommended using as: scopeNameOrFeatureName_someGroupActionName

> The `parentItemId`, if used, must point to an existing *item*, otherwise the group won't be displayed.

> The `parentItemId`, if used, cannot point to a children (or any descendant) of the current group.

&nbsp;
### Update a group
`updateGroup( groupId, groupData )`  - Update the group data.



&nbsp;  
Example:
```JS
updateGroup(
	'groupId',			// Required.
 	{
		title: 'some title',	// One or more properties to be update.
 	}
 );
```

&nbsp;  
Notes:
> The groupId parameter must point to an existing group.

&nbsp;
### Delete a group
`deleteGroup( groupId )` - Delete the group.

&nbsp;  
Example:
```JS
deleteGroup(
	'groupId',	// Required.
 );
```

&nbsp;  
Notes:
> The group will be deleted with all its descendants.


&nbsp;
### Add item
`addItem( groupId, newItem )` - Add a new item to an existing group.

&nbsp;  
Example:
```JS
addItem(
    'groupId',
 	{
 		id: '',			// Required.
		label: '',		// Optional, if not specified will be '' as default.
		icon: null,		// Optional, if not specified will be null as default.
		shortcut: '',		// Optional, if not specified will be '' as default.
		badge: null,		// Optional, if not specified will be null as default.
		action: null,		// Optional, if not specified will be null as default.
		onMouseEnter: null,	// Optional, if not specified will be null as default.
		onMouseLeave: null,	// Optional, if not specified will be null as default.
 	}
 );
```

&nbsp;  
Notes:
> The groupId parameter must point to an existing group.

> The new item will reside inside its group parent 'items[]'. 

> The item 'id' property must be unique. recommended using as: nameOfGroup_itemAction.

>  The item 'label' property is important, it describes the items action.
 
> The item 'label' property can contain up to 30 chars max (or will be trimmed).


&nbsp;
### Update item
`updateItem( groupId, itemId, itemData )` - Update an item data.

&nbsp;  
Example:
```JS
updateItem(
	'groupId',			// Required.
	'itemId',			// Required.
 	{
		label: 'action name',	// One or more item properties to be update.
 	}
 );
```

&nbsp;  
Notes:
> The groupId parameter must point to an existing group.

> The itemId parameter must point to an existing item inside the given group.


&nbsp;
### Delete item
`deleteItem( groupId, itemId )` - Delete an item.

&nbsp;  
Example:
```JS
deleteItem(
	'groupId',		// Required.
	'itemId',		// Required.
 );
```

&nbsp;  
Notes:
> The item will be deleted with all the subgroups that points to it.


&nbsp;
### Get config
`getConfig()` - Get the config tree of groups & items.
This method is used to get the config tree for building the context menu structure in the UI.
It returns an array of groups, that contains items, that may contain subgroups and so on.


&nbsp;
## Understanding the usage flow

The config tree is built as an array because of the need to manage order of groups & items in the tree.
The manager is built to allow prioritizing built-in elements groups over 3rd party registrations.
To better understand that, let's dive into the registration of new groups and learn how the triggering flow works:

### Registration of new items

There are two cases for adding items to the context menu. The first case is for built-in entities in the editor (sections, columns, containers, widgets, panels, etc.) that add items to the context menu. The second one is for third-party extensions/plugins. Both of them use the same API methods of the `ContextMenuManager`.

The built-in element has the power to prioritize the registration order of the 1st & 3rd party items and trigger the entire flow.

### Triggering the context menu flow

The element triggers a [`contextmenu`](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event) event on right-click or on context-menu keyboard key down, inside the element scope. The `oncontextmenu` calls a function that starts the flow as described:

1. Creates an instance of `ContextMenuManager` class.

2. Registers its context menu groups & items, using the `ContextMenuManager` API methods.

3. Dispatch a custom event that third-party listens to.

4. Third-party registers their own groups & items, that will be displayed after the elements groups.

5. Then, if needed, the element registers last groups & items (items to be displayed after 3rd parties items).

6. Call methods `getConfig()`, to get the config tree context menu structure.

7. Sends the config data to the context menu UI components.



&nbsp;
## Example of usage

```JS

import {
	ContextMenuManager
} from 'elementor/packages/context-menu/manager';

// Element triggering the flow, when right-clicked on it:
export const onContextMenu = () => {
	const manager = new ContextMenuManager();

	// Add groups that will be displayed first:
	manager.createGroup( {
		id: 'groupId-1'
	} );

	manager.addItem(
		'groupId-1', {
			id: 'some-item-id',
			label: 'Do some magic'
		}
	);

	manager.createGroup( {
		id: 'groupId-2'
	} );

	manager.addItem(
		'groupId-1', {
			id: 'another-item-id',
			label: 'Do another magic'
		}
	);

	// Allow adding groups from Third party:
	window.dispatchEvent( new CustomEvent( 'elementor/element/contextMenu', {
		detail: {
			manager, // Send the manager instance
			elType: 'widget', // Send data about the triggerer
			widgetType: 'awesome-widget3', // Send data about the triggerer
		}
	} ) );

	// Add groups that will be displayed last:
	manager.createGroup( {
		id: 'groupId-last'
	} );

	manager.addItem(
		'groupId-last', {
			id: 'last-item-id',
			label: 'Do the last magic'
		}
	);

	// Trigger the UI components to display the config tree:
	renderUI( manager.getConfig() )
};

// Third party registers its own groups:
window.addEventListener('elementor/element/contextMenu', ( e ) => {

	// Third party deside on whitch element to display its groups:
	if ( 'container' !== e.detail.elType ) {
		return;
	}

	e.detail.manager.createGroup( {
		id: 'someCustomGroup'
	} );

	e.detail.manager.addItem(
		'someCustomGroup', {
			id: 'custom-item-id',
			label: 'Do the custom magic'
		}
	);

	// Registering a nested group, will be nested inside the 'custom-item-id' item:
	e.detail.manager.createGroup( {
		id: 'someNestedGroup',
		parentItemId: 'custom-item-id'
	} );

	e.detail.manager.addItem(
		'someNestedGroup', {
			id: 'someNested-item-id',
			label: 'Do the custom miracle'
		}
	);
} );

```

