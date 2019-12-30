## Component -- `$e.components.get('document/dynamic')`

*  **Name**: Dynamic.
*  **Description**: Dynamic enable, disable and change.

## `document/dynamic/` -- Commands
| Command               | Access                                  | Description         
|-----------------------|-----------------------------------------|-----------------------------------------
| [Disable](#disable-command----erungetdocumentdynamicdisable)    | `$e.run('document/dynamic/disable')`    | Disable dynamic. 
| [Enable](#enable-command----erungetdocumentdynamicenable)       | `$e.rtbhun('document/dynamic/enable')`     | Enable dynamic.
| [Settings](#settings-command----erungetdocumentdynamicsettings) | `$e.run('document/dynamic/settings')`   | Change dynamic.


## Disable _Command_ -- `$e.run('document/dynamic/disable')`
*  **Name**: Disable.
*  **Description**: Disable dynamic settings.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Type          | Property                  | Requirement       | Description |
    |---            |---                        |---                |---|
    | `{Container}` | _container OR containers_ | **required**      | 
    | `{object}`    | _settings_                | **required**      | Dynamic settings to disable <TODO EXPLAIN WHY>

* **Examples**:
    Assuming we have a widget with dynamic tag for *title*, and want to disable it.
    
    |    |    |
    |---:|:---|
    | ![edit-heading-with-dynamic-title-date](../images/edocument-dynamic/edit-heading-with-dynamic-title-date.png) | ![widget-heading-with-dynamic-title-date](../images/edocument-dynamic/widget-heading-with-dynamic-title-date.png)

    ```javascript
      // Get the view by id, then get the container.
      const eWidget = $e.utils.document.findViewById( '0b9da89' ).getContainer();
  
      // Disable dynamic tag 'date'.
      $e.run( 'document/dynamic/disable', {
          container: eWidget,
          settings: {
              title: true,
          },
      } );
    ```
    Will disable dynamic tag for title.

## Enable _Command_ -- `$e.run('document/dynamic/enable')`
*  **Name**: Enable.
*  **Description**: Enable dynamic settings.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Type          | Property                  | Requirement       | Description |
    |---            |---                        |---                |---|
    | `{Container}` | _container OR containers_ | **required**      | 
    | `{object}`    | _settings_                | **required**      | Dynamic settings to enable

* **Examples**:
    Enable dynamic title for heading, assuming you have simple widget like this:
    
    ![Example2](../images/edocument-dynamic/widget-heading.png)
    ```javascript
    // Get heading container.
    const eWidget = $e.utils.document.findViewById( '0b9da89' ).getContainer(),
      postDateTag = elementor.dynamicTags.tagDataToTagText( elementor.helpers.getUniqueID(), 'post-date', new Backbone.Model( {} ));
  
    // Enable dynamic tag `post-date` for title.
    $e.run( 'document/dynamic/enable', {
          container: eWidget,
          settings: {
              title: postDateTag,
          },
    } );
    ```
    Will enable dynamic tag: 'post-date' for heading title:
    
    ![widget-heading-with-dynamic-title-date](../images/edocument-dynamic/widget-heading-with-dynamic-title-date.png)


## Settings _Command_ -- `$e.run('document/dynamic/settings')`
*  **Name**: Settings.
*  **Description**: Change dynamic settings.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Type          | Property                           | Requirement       | Description |
    |---            |---                                 |---                |---|
    | `{Container}` | _container OR containers_          | **required**      | 
    | `{object}`    | _settings_                         | **required**      | Dynamic settings to enable
    | `{object}`    | _options_ { debounce: `{boolean}`} | **optional**      | Use debounce? default: `true`

* **Examples**:
    Example change dynamic settings for title with dynamic tag *post-date*.
    Assuming you have a heading with 'post-date' dynamic tag for title.
    
    ![edocument-dynamic-3](../images/edocument-dynamic/3.jpg)
    
    And you want to change the format to human readable format. use next example:
    
    ```javascript
    // Get heading container.
    const eWidget = $e.utils.document.findViewById( '2de40c2' ).getContainer(),
      postDateTag = elementor.dynamicTags.tagDataToTagText( elementor.helpers.getUniqueID(), 'post-date', new Backbone.Model( { format: 'human'} ));
    
    // Change dynamic settings.
    $e.run( 'document/dynamic/settings', {
          container: eWidget,
          settings: {
              title: postDateTag,
          },
    } );
    ```
    The result will be:
    
    ![edocument-dynamic-4](../images/edocument-dynamic/4.jpg)



### [Back](edocument.md) 
