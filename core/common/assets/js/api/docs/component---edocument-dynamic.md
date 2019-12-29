## Component -- `$e.components.get('document/dynamic')`

*  **Name**: Dynamic.
*  **Description**: Dynamic enable, disable and change.

## All **Document/Dynamic** Commands
| Command               | Access                                  | Description         
|-----------------------|-----------------------------------------|-----------------------------------
| [Disable](#disable)   | `$e.run('document/dynamic/disable')`    | Disable dynamic. 
| [Enable](#enable)     | `$e.run('document/dynamic/enable')`     | Enable dynamic.
| [Settings](#settings) | `$e.run('document/dynamic/settings')`   | Change dynamic.


### Disable _Command_ -- `$e.run.get('document/dynamic/disable')`
*  **Name**: Disable.
*  **Description**: Disable dynamic settings.
*  **Returns**: `{void}`
*  **Arguments**: 

    |               |                           |                   |   |
    |---            |---                        |---                |---|
    | `{Container}` | _container OR containers_ | **required**      | 
    | `{object}`    | _settings_                | **required**      | Dynamic settings to disable

* **Examples**:
    Assuming we have a widget with dynamic tag for *title*, and want to disable it.
    ![Example1](images/edocument-dynamic/1.jpg)

    ```javascript
      // Get the view by id, then get the container.
      const eWidget = $e.utils.document.findViewById( '04c56e0' ).getContainer();
  
      // Disable dynamic tag 'date'.
      $e.run( 'document/dynamic/disable', {
          container: eWidget,
          settings: {
              title: true,
          },
      } );
    ```
    Will disable dynamic tag for title.
