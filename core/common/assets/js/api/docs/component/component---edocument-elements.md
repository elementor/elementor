## Component -- `$e.components.get('document/elements')`

*  **Name**: Elements.
*  **Description**: Provide a way to manage elements, create, edit, delete. copy, paste, etc...

## All **Document/Elements** Commands
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
*  **Returns**: `{Container | Array.<Container>}` *Created container*.

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{object}`    | model                              | **required**      | 
    | `{object}`    | options                            | **optional**      | 

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
    Result: ![Example5](edocument-elements/1.jpg)
    
