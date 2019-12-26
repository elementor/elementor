# API - `$e.components`
The new Components API (since 2.7.0), provides a simple and convenient way to bind all route and commands, and keyboard shortcuts that belong to a UI component – into one controller.
The full list of components, including custom & 3rd routes, is available via: `$e.components.getAll();`
Each component has it’s unique namespace, that all it’s command and routes are nested under it.

On route to a component route, the component becomes “active” that mean that allows make sure that keyboard shortcuts of this component will work only if the component is active.

The components are extensible so a 3rd party plugin can add some routes, command and shortcuts to an existing component.

*  **Description**: `$e.components` API is a manager, for whole **api** components.
*  **Location**: *core/common/assets/js/api/apis/components.js*
*  **Parent**: `elementorModules.Module`
*  **Methods**:

	| Method                       | Parameters                     | Returns                                       | Description
	|------------------------------|--------------------------------|-----------------------------------------------|------------------------------|
	| `$e.components.getAll()`     |                                | `{array.<string>}`                            | Receive all components.
	| `$e.components.register()`   | `{BaseComponent}` *component*  | `{BaseComponent}` *component*                 | Register a component.
	| `$e.components.get()`        | `{string}` *id*                | `{BaseComponent}` *component*                 | Get component instance by id.
	| `$e.components.getActive()`  |                                | `{Object.<BaseComponent>}` *activeComponents* | Get active components.
	| `$e.components.activate()`   | `{string}` *namespace*         |                                               | Activate component.
	| `$e.components.inactivate()` | `{string}` *namespace*         |                                               | Deactivate component.
	| `$e.components.isActive()`   | `{string}` *namespace*         | `{boolean}` *isActive*                        | Is component active.

* **Examples**:
    ```javascript
     // Example create and register new component..
     // Important: Available to run in the console does not depends on anything else``.

     class ExampleCommand extends $e.modules.CommandBase {
        apply( args ) {
            // Output command args to console.
            console.log( 'ExampleCommand: ', args );
     
            // Return object as example.
            return {
                example: 'result from ExampleCommand',
            };
        }
     }
     
     class CustomComponent extends $e.modules.Component {
        getNamespace() {
            return 'custom-component';
        }
     
        defaultCommands() {
            // Object of all the component commands.
            return {
                example: ( args ) => ( new ExampleCommand( args ) ).run(),
            };
        }
     }
     
     // Register the new component.
     $e.components.register( new CustomComponent() );
     
     // Run's 'example' command from 'custom-component'.
     result = $e.run( 'custom-component/example', {
        property: 'value',
     } );
     
     // Output command run result.
     console.log( 'e-components-eg-1-result: ', result );
    
    ```
  
### [Back](readme.md) 
