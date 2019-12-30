## Component -- `$e.components.get('document/elements')`

*  **Name**: Elements.
*  **Description**: Provide a way to manage elements, create, edit, delete. copy, paste, etc...

## Component `document/elements/` -- Commands
| Command                                   | Access                                             | Description         
|-------------------------------------------|----------------------------------------------------|-----------------------------------------
| [Copy](#)                                 | `$e.run('document/elements/copy')`                 | Copy container. 
| [Copy-All](#)                             | `$e.run('document/elements/copy-all')`             | Copy all containers. 
| [Create](#)                               | `$e.run('document/elements/create')`               | Create element. 
| [Delete](#)                               | `$e.run('document/elements/delete')`               | Delete container. 
| [Duplicate](#)                            | `$e.run('document/elements/duplicate')`            | Duplicate container. 
| [Empty](#)                                | `$e.run('document/elements/empty')`                | Empty document. 
| [Import](#)                               | `$e.run('document/elements/import')`               | Import to document. 
| [Paste](#)                                | `$e.run('document/elements/paste')`                | Paste to container. 
| [Paste-Style](#)                          | `$e.run('document/elements/paste-style')`          | Paste style to container. 
| [Reset-Style](#)                          | `$e.run('document/elements/reset-style')`          | Reset style to container. 
| [Settings](#)                             | `$e.run('document/elements/settings')`             | Change settings of container. 

## Copy _Command_ -- `$e.run('document/elements/copy')`
*  **Name**: Copy.
*  **Description**: Copy container.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{String}`    | storageKey                         | **optional**      | default: `{'clipboard'}`

## CopyAll _Command_ -- `$e.run('document/elements/copy-all')`
*  **Name**: Copy-All.
*  **Description**: Copy all containers.
*  **Returns**: `{void}`
*  **Arguments**: None.

## Create _Command_ -- `$e.run('document/elements/create')`
*  **Name**: Create.
*  **Description**: Create element from model.
*  **Returns**: `{Container | Array.<Container>}` *Created container(s)*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{Object}`    | model                              | **required**      | 
    | `{Object}`    | options                            | **optional**      | 

    *options:*
    ```javascript
    {
        at: {Number},                                // Position.
        clone: {Boolean},                            // Generate unique id for the model.
        trigger: {Boolean},                          // TODO: Mati help.
        edit: {Boolean},                             // Is turn edit panel for the new element.
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
    Result: ![empty-column](../images/base/empty-column.png)
    Now to create widget, we need column, here is two examples how to reach column:
    ```javascript
    const eColumn = eSection.view.children.findByIndex( 0 ).getContainer();
    ```
    OR
    ```javascript
    const eColumn = $e.utils.document.findContainerById('cb70e3c');
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
    Result: ![widget-heading](../images/base/widget-heading.png)

## Create _Delete_ -- `$e.run('document/elements/delete')`
*  **Name**: Delete.
*  **Description**: Delete container.
*  **Returns**: `{Container | Array.<Container>}` *Deleted container(s)*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 

* **Examples**:
    Delete a section, Assuming we have this section, and want to delete it.
    ![widget-heading](../images/base/widget-heading.png)
    ```javascript
    // Get section container.
    const eSection = $e.utils.document.findContainerById('886643f');
    
    $e.run( 'document/elements/delete', { 
        container: eSection,
    } );
    ```
    result: section deleted and all children elements.

## Duplicate _Command_ -- `$e.run('document/elements/duplicate')`
*  **Name**: Duplicate.
*  **Description**: Duplicate container.
*  **Returns**: `{Container | Array.<Container>}` *Created container(s)*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 

* **Examples**:
    Duplicate a section, Assuming we have this section, and want to duplicate it.
    ![widget-heading](../images/base/widget-heading.png)
    ```javascript
    // Get section container.
    const eSection = $e.utils.document.findContainerById('886643f');
    
    $e.run( 'document/elements/duplicate', { 
        container: eSection,
    } );
    ```
    Result: 
    ![widget-heading-duplicated](../images/base/widget-heading-duplicated.png)

## Empty _Command_ -- `$e.run('document/elements/empty')`
*  **Name**: Empty.
*  **Description**: Delete all elements from the document.
*  **Returns**: `{void}`
*  **Arguments**: None.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Boolean}`   | force                              | **optional**      | default: `{false}`, if true will delete all elements without confirmation.


## Import _Command_ -- `$e.run('document/elements/import')`
*  **Name**: Import.
*  **Description**: Import elements to the document.
*  **Returns**: `{void}`
*  **Arguments**:

    | Type                 | Property                             | Requirement       | Description |
    |---                   |---                                   |---                |---|
    | `{Backbone.Model}`   | model                                | **required**      | Template model.
    | `{Object}`           | data                                 | **required**      | Data.
    | `{Object}`           | options                              | **optional**      | 

    *data:*
    ```javascript
    {
       content: {Array},           // The content of the template to import.
       page_settings: {Array},     // Custom page_settings to import ( only if options.withPageSettings = true ).
    }
    ```
    *options:*
    ```javascript
    {
        at: {Number},                                // Position ( Automatically increased ).
        clone: {Boolean},                            // Generate unique id for the model.
        trigger: {Boolean},                          // TODO: Mati help.
        edit: {Boolean},                             // Is turn edit panel for the new element.
        onBeforeAdd: {function()},                   // Run callback before add.
        onAfterAdd: {function( newModel, newView )}, // Run callback after add.
        withPageSettings: {Boolean},                 // Apply data.page_settings to page_settings document.
    }
    ```

## Paste _Command_ -- `$e.run('document/elements/paste')`
*  **Name**: Paste.
*  **Description**: Paste to container.
*  **Returns**: `{Container | Array.<Container>}` *Pasted container(s)*.
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{String}`    | storageKey                         | **optional**      | default: `{'clipboard'}`
* **Examples**:
    Copy widget and paste it into column.

    ```javascript
    const eColumn = $e.utils.document.findContainerById('cb70e3c'),
        eWidget = $e.utils.document.findContainerById('2e4b783');
    
    $e.run('document/elements/copy', { 
        container: eWidget
    } );
    
    const pastedContainers = $e.run('document/elements/paste', { 
        container: eColumn
    } );
    
    console.log( pastedContainers );
    ```
    Result:![widget-heading-pasted](../images/base/widget-heading-pasted.png)

## Paste-Style _Command_ -- `$e.run('document/elements/paste-style')`
*  **Name**: Paste-Style.
*  **Description**: Paste style to container.
*  **Returns**: `{void}`.
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{String}`    | storageKey                         | **optional**      | default: `{'clipboard'}`
* **Examples**:
    Copy style from one widget and paste it into another.
    Assuming we have a two widgets one with special style, another one with defaults, we will copy the style of the one with the default and paste to into the speical one, to restore him to default.
    ## TODO: Example does not work, since is-paste-style-enabled, does dont know about selected element.
    ### `Document/Selection` ?
    ![widget-heading-another-heading-with-special-style](../images/edocument-elements/widget-heading-another-heading-with-special-style.png)

    ```javascript
    const eSpecialWidget = $e.utils.document.findContainerById('2e4b783'),
        eDefaultWidget = $e.utils.document.findContainerById('192125b');
    
    $e.run('document/elements/copy', { 
        container: eDefaultWidget
    } );
    
    $e.run('document/elements/paste-style', { 
        container: eSpecialWidget
    } );
    ```
    Result:![widget-heading-pasted](../images/base/widget-heading-pasted.png)

## Reset-Style _Command_ -- `$e.run('document/elements/reset-style')`
*  **Name**: Reset-Style.
*  **Description**: Rest style of container.
*  **Returns**: `{void}`.
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{String}`    | storageKey                         | **optional**      | default: `{'clipboard'}`
* **Examples**:
    Reset style of widget.
    Assuming we have a widget with special style.
    ![widget-heading-another-heading-with-special-style](../images/edocument-elements/widget-heading-another-heading-with-special-style.png)

    ```javascript
    const eWidget = $e.utils.document.findContainerById('2e4b783');
    
    $e.run('document/elements/reset-style', { 
      container: eWidget
    } );
    ```
    Result:
    
    ![widget-heading-pasted](../images/base/widget-heading-pasted.png)

