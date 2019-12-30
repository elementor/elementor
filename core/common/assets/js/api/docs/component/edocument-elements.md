## Component -- `$e.components.get('document/elements')`

*  **Name**: Elements.
*  **Description**: Provide a way to manage elements, create, edit, delete. copy, paste, etc...

## `document/elements/` -- Commands
| Command                                   | Access                                            | Description         
|-------------------------------------------|---------------------------------------------------|-----------------------------------------
| [Copy](#)                                 | `$e.run('document/dynamic/copy')`                 | Copy container. 
| [Copy-All](#)                             | `$e.run('document/dynamic/copy-all')`             | Copy all containers. 
| [Create](#)                               | `$e.run('document/dynamic/create')`               | Create element. 
| [Delete](#)                               | `$e.run('document/dynamic/delete')`               | Delete container. 
| [Duplicate](#)                            | `$e.run('document/dynamic/duplicate')`            | Duplicate container. 
| [Empty](#)                                | `$e.run('document/dynamic/empty')`                | Empty document. 
| [Import](#)                               | `$e.run('document/dynamic/import')`               | Import. 
| [Paste](#)                                | `$e.run('document/dynamic/paste')`                | Paste. 
| [Paste-Style](#)                          | `$e.run('document/dynamic/paste-style')`          | Disable dynamic. 
| [Reset-Style](#)                          | `$e.run('document/dynamic/reset-style')`          | Disable dynamic. 
| [Settings](#)                             | `$e.run('document/dynamic/settings')`             | Disable dynamic. 

## Copy _Command_ -- `$e.run.get('document/elements/copy')`
*  **Name**: Copy.
*  **Description**: Copy container.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{string}`    | storageKey                         | **optional**      | default: `{'clipboard'}`

## Copy _Command_ -- `$e.run.get('document/elements/copy-all')`
*  **Name**: Copy-All.
*  **Description**: Copy all containers.
*  **Returns**: `{void}`
*  **Arguments**: None.

## Create _Command_ -- `$e.run.get('document/elements/create')`
*  **Name**: Create.
*  **Description**: Create element from model.
*  **Returns**: `{Container | Array.<Container>}` *Created container(s)*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{object}`    | model                              | **required**      | 
    | `{object}`    | options                            | **optional**      | 

    *options:*
    ```javascript
    {
        at: {integer},                               // Position.
        clone: {boolean},                            // Generate unique id for the model.
        trigger: {boolean},                          // TODO: Mati help.
        edit: {boolean},                             // Is turn edit panel for the new element.
        onBeforeAdd: {function()},                   // Run callback before add.
        onAfterAdd: {function( newModel, newView )}, // Run callback after add.
    }
    ```
   
* **Examples**:
    Create Heading widget 
    ```javascript
    // Create section.
    const eSection = $e.run( 'document/elements/create', {
      container: elementor.getPreviewContainer(),
      columns: 1,
      model: { elType: 'section' },
    } );  
    ```
    Result: ![edocument-elements-1](../images/edocument-elements/1.jpg)
    Now to create widget, we need column, here is two examples how to reach column:
    ```javascript
    const eColumn = eSection.view.children.findByIndex( 0 ).getContainer();
    ```
    OR
    ```javascript
    const eColumn = $e.utils.document.findViewById('9bb43ed').getContainer();
    ```
    Then let create heading widget at the column we reach above:
    ```javascript
    $e.run( 'document/elements/create', {
        container: eColumn,
        model: { 
          elType: 'widget',
          widgetType: 'heading',
        },
    } );
    ```
    Result: ![edocument-elements-2](../images/edocument-elements/2.jpg)

## Create _Delete_ -- `$e.run.get('document/elements/delete')`
*  **Name**: Delete.
*  **Description**: Delete container.
*  **Returns**: `{Container | Array.<Container>}` *Deleted container(s)*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 

* **Examples**:
    Delete a section, Assuming we have this section, and want to delete it.
    ![edocument-elements-2](../images/edocument-elements/2.jpg)
    ```javascript
    // Get section container.
    const eSection = $e.utils.document.findViewById('847332a').getContainer();
    
    $e.run( 'document/elements/delete', { 
        container: eSection,
    } );
    ```
    result: section deleted and all children elements.
