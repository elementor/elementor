## Component -- `$e.components.get('document/dynamic')`

*  **Name**: Dynamic.
*  **Description**: Dynamic enable, disable and change.

## Component `document/dynamic/` -- Commands
| Command                                                         | Access                                  | Description         
|-----------------------------------------------------------------|-----------------------------------------|-----------------------------------------
| [Disable](#disable-command----erundocumentdynamicdisable)       | `$e.run('document/dynamic/disable')`    | Disable dynamic of container. 
| [Enable](#enable-command----erundocumentdynamicenable)          | `$e.run('document/dynamic/enable')`     | Enable dynamic of container.
| [Settings](#settings-command----erundocumentdynamicsettings)    | `$e.run('document/dynamic/settings')`   | Change dynamic settings of container.


## Disable _Command_ -- `$e.run('document/dynamic/disable')`
*  **Name**: Disable.
*  **Description**: Disable dynamic settings.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Property     | Type                  | Requirement   | Description |
    |---           |---                    |---            |---|
    | _container_  | `{Container}`         | **required**  | Container to disable.
    | _containers_ | `{Array.<Container>}` | **required**  | Containers to disable.
    | _settings_   | `{Object}             | **required**  | Dynamic settings to disable <TODO EXPLAIN WHY>

* **Examples**:
    Assuming we have a widget with dynamic tag for *title*, and want to disable it.
    
    |    |    |
    |---:|:---|
    | ![edit-heading-with-dynamic-title-date](../images/edocument-dynamic/edit-heading-with-dynamic-title-date.png) | ![widget-heading-with-dynamic-title-date](../images/edocument-dynamic/widget-heading-with-dynamic-title-date.png)

    ```javascript
      // Get the view by id, then get the container.
      const eWidget = $e.utils.document.findContainerById( '0b9da89' );
  
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

    | Property     | Type                  | Requirement   | Description |
    |---           |---                    |---            |---|
    | _container_  | `{Container}`         | **required**  | Container to enable.
    | _containers_ | `{Array.<Container>}` | **required**  | Containers to enable.
    | _settings_   | `{Object}`            | **required**  | Dynamic settings to enable

* **Examples**:
    Enable dynamic title for heading, assuming you have simple widget like this:
    
    ![widget-heading](../images/base/widget-heading.png)
    ```javascript
    // Get heading container.
    const eWidget = $e.utils.document.findContainerById( '0b9da89' ),
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
*  **Description**: Change dynamic settings of container.
*  **Returns**: `{void}`
*  **Arguments**: 

    | Property     | Type                  | Requirement   | Description |
    |---           |---                    |---            |---|
    | _container_  | `{Container}`         | **required**  | Container target.
    | _containers_ | `{Array.<Container>}` | **required**  | Containers target.
    | _settings_   | `{Object}`            | **required**  | Dynamic settings to change.
    
* **Examples**:
    Example change dynamic settings for title with dynamic tag *post-date*.
    Assuming you have a heading with 'post-date' dynamic tag for title.
    
    ![widget-heading-with-dynamic-title-date](../images/edocument-dynamic/widget-heading-with-dynamic-title-date.png)
    
    And you want to change the format to human readable format. use next example:
    
    ```javascript
    // Get heading container.
    const eWidget = $e.utils.document.findContainerById( '0b9da89' ),
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
    
    ![widget-heading-with-dynamic-title-date-human-readable](../images/edocument-dynamic/widget-heading-with-dynamic-title-date-human-readable.png)


### [Back](edocument.md) 
