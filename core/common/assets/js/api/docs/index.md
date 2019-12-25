# Elementor JS `$e`  API
## Introduction

**Elementor JS API** - is set of *API(s)*, *modules*, and *utils*, used to communicating with *elementor*.
 represented as `$e` - Global Variable.

# Overview
| API Name                                       | Access          | Description           |
|------------------------------------------------|-----------------|-----------------------|
| [Components](#api---ecomponents)              | `$e.components` | Components management |
| [Hooks](#api---ehooks)          | `$e.hooks`      | Data oriented hooks   |
| [Events](#api---eevents)       | `$e.events`     | UI oriented events    |
| [Commands](#api---ecommands) | `$e.commands`   | Commands management   |
| Routes   | `$e.routes`    | Routes management |
| Shortcuts| `$e.shortcuts` | Shortcuts component |
| DevTools | `$e.devTools`  | External plugin for developers. |


# Aliases
| Function Name | Alias        | API           | Original            | Description			     |
|---------------|--------------|---------------|---------------------|---------------------------|
| run           | `$e.run()`   | `$e.commands` | `$e.commands.run()` | Run command.              |
| route         | `$e.route()` | `$e.routes`   | `$e.routes.run()`   | Run route ( open route ). |


# API - `$e.components`
The new Components API (since 2.7.0), provides a simple and convenient way to bind all route and commands, and keyboard shortcuts that belong to a UI component – into one controller.
The full list of components, including custom & 3rd routes, is available via: `$e.components.getAll();`
Each component has it’s unique namespace, that all it’s command and routes are nested under it.

On route to a component route, the component becomes “active” that mean that allows make sure that keyboard shortcuts of this component will work only if the component is active.

The components are extensible so a 3rd party plugin can add some routes, command and shortcuts to an existing component.

*  **Description**: `$e.components` API is a manager of `$e` _components_.
*  **Location**: *core/common/assets/js/api/apis/components.js*
*  **Parent**: `elementorModules.Module`
*  **Methods**:

	|  Name | Access | Parameters | Returns | Description
	|---------|----------|--------------|-----------|-------------|
	| **getAll** | `$e.components.getAll()` |   | `{Array.<String>}` | Receive all components.
	| **register** | `$e.components.register()` |  `{BaseComponent}` *component* | `{BaseComponent}` *component* | Register a component.
	| **get** | `$e.components.get()` | `{String}` *id* | `{BaseComponent}` *component* | Get component instance by id.
	| **getActive** | `$e.components.getActive()` | | `{Object.<BaseComponent>}` *activeComponents* | Get active components.
	| **active** | `$e.components.activate()` | `{String}` *namespace* | | Activate component.
	| **inactive** | `$e.components.inactivate()` | `{String}` *namespace* | | Deactivate component.
	| **isActive** | `$e.components.isActive()` | `{String}` *namespace* | `{Boolean}` *isActive* | Is component active.

* **Examples**:
    ```javascript
     // Example create and register new component.
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
     
     class CustomComponent extends elementorModules.common.Component {
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

## API - `$e.hooks`
*  **Description**: `$e.hooks` api is a manager of `$e.hooks`, allow you to create custom **data manipulation** of *elementor* data model, and create a dependencies, the _hooks_ attached 
to  `$e.commands`  and each  **hook** being fired after/before running a command, that runs by  `$e.run()`
*  **Location**: *core/common/assets/js/api/apis/hooks.js*
*  **Parent**: [`{Callbacks}`](#Callbacks)
*  **Methods**:

	| Name                   | Access                          | Params                                                   |  Returns              | Description                                              
	|------------------------|---------------------------------|----------------------------------------------------------|-----------------------|-----------------------------------------------------------
	| **registerAfter**      | `$e.hooks.registerAfter()`      | `{CallableBase}` *instance*                              | `{Object}` *callback* | Register a hook that being fired after the command runs.  
	| **registerDependency** | `$e.hooks.registerDependency()` | `{CallableBase}` *instance*                              | `{Object}` *callback* | Register a hook that being fired before the command runs.
	| **runAfter**           | `$e.hooks.runAfter()`           | `{string}` *command*, `{Object}` *args*, *result*        |                       | Runs hook after.
	| **runAfter**           | `$e.hooks.runDependency()`      | `{string}` *command*, `{Object}` *args*                  |                       | Runs hook dependency.

	> **Note:** Please look at class parent: `{Callbacks}` for all the methods.
 
  * ***Important***: All hooks should be created by extending [`{( HookAfter | HookDependency )}`](#HookAfter-HookDependency) located at:
    * `core/common/assets/js/api/modules/hook-base/after.js`
    * `core/common/assets/js/api/modules/hook-base/dependency.js`

*  **Examples**:
   * Built in hooks: *`assets/dev/js/editor/document/callback/hooks`*

   * Register hook **_after_** command runs:
        ```javascript
        // Example of hook after the command runs.
        class CustomHook extends $e.modules.HookBase.After {
            getCommand() {
                // Command to hook.
                return 'custom-component/example';
            }
        
            getId() {
                // Unique id for the hook.
                return 'custom-component-example-hook';
            }
        
            /*
             * Recommended function, used for optimization, if the container type is known in advance,
             * you can pass it here.
             */
            // bindContainerType() {
            // If `args.container.type` is always the same for the hook return it:
            // return 'container_type';
            // }
        
            /* Optional function, the conditions for hook to be run. */
            getConditions( args ) {
                return 'value' === args.property;
            }
        
            /*
             * The actual hook logic.
             */
            apply( args, containers ) {
                console.log( 'My hook custom logic', 'args: ', args, 'containers: ', containers );
            }
        }
        
        // Add new hook to `$e.hooks`;
        const myHook = new CustomHook();
        
        // Output new hook.
        console.log( myHook );
        
        // Output all hooks after.
        console.log( $e.hooks.getAll().after );
        
        // Test the hook
        result = $e.run( 'custom-component/example', {
            property: 'value', // The conditions for the hook to be run.
        } );
        
        // Output command run result.
        console.log( 'e-hooks-eg-1-result:', result );
		```

    * Register hook **dependency** that applies before the command runs
    * **Note**: Dependency is breakable hook.
		```javascript
		// Example of hook that blooks column creation, if it reach maximum columns count.
		class SectionColumnsLimit extends $e.modules.HookBase.Dependency {
		   getCommand() {
		      return 'document/elements/create';
		   }

		   getId() {
		      return 'section-columns-limit';
		   }

		   bindContainerType() {
		      return 'section';
		   }

		   /* NOTE: This is a Dependency hook and its breakable, when apply returns false */
		   apply( args ) {
		      const { containers = [ args.container ] } = args;
  
		      // If one of the targets have maximum columns reached break the command.
		      return ! containers.some( ( /**Container*/ container ) => {
		         return container.view.isCollectionFilled();
		      } );
		   }
		}
		```
        > **Note:** further information about [`{CallableBase}`](#CallableBase)**class**.

## API -  `$e.events`
*  **Description**: `$e.events` component is a manager of `$e` _events_, allow you to create custom **logic** that runs *after/before* the command without effect the data *elementor* data model,  history, etc...
the events attached to  `$e.commands`  and each  _event_ being fired after/before  running a command, that runs by  `$e.run()`, Mainly used for UI/View manipulation without affecting the data model.
*  **Location**: *core/common/assets/js/api/apis/events.js*
*  **Parent**: [`{Callbacks}`](#Callbacks)
*  **Methods**:

	| Name               | Access                       | Params                                                   | Returns                | Description
	|--------------------|------------------------------|----------------------------------------------------------|------------------------|----------------------------------------------------------------|
	| **registerAfter**  | `$e.events.registerAfter()`  | `{CallableBase}` *instance*                              | `{Object}` *callback*  | Register a event that being fired after the command runs.
	| **registerBefore** | `$e.events.registerBefore()` | `{CallableBase}` *instance*                              | `{Object}` *callback*  | Register a event that being fired before the command runs.
	| **runAfter**       | `$e.events.runAfter()`       | `{string}` *command*, `{Object}` *args*, *result*        |                        | Runs event after.
	| **runAfter**       | `$e.events.runBefore()`      | `{string}` *command*, `{Object}` *args*                  |                        | Runs before dependency.

	> **Note:** Please look at class parent: `{Callbacks}` for all the methods.
 
  * ***Important***: All hooks should be created by extending [`{( EventAfter | EventBefore )}`](#EventAfter-EventBefore) located at:
    * `core/common/assets/js/api/modules/event-base/after.js`
    * `core/common/assets/js/api/modules/event-base/dependency.js`
 * **Examples**:
   * Built in events:  *`assets/dev/js/editor/document/callback/events`*
   * Register event that runs **_after_** command runs

		```javascript
        // Example of event after the command runs and change ( CSS Class ) of all div elements.
        class CustomEvent extends $e.modules.EventBase.After {
            getCommand() {
                // Command to listen.
                return 'custom-component/example';
            }
        
            getId() {
                // Unique id for the event.
                return 'custom-component-example-event';
            }
        
            getConditions( args ) {
                // Conditions for the event to be applied.
                if ( args.toggleClass ) {
                    return true;
                }
        
                return false;
            }
        
            /*
             * The actual event logic.
             */
            apply( args, result ) {
                console.log( 'My event custom logic', 'args: ', args, 'result: ', result );
        
                // Add 'custom-component' class for all div elements.
                jQuery.find( 'div' ).forEach( ( $div ) => {
                    $div = jQuery( $div );
        
                    $div.addClass( 'custom-component' );
                } );
            }
        }
        
        // Add new event to `$e.events`;
        const myEvent = new CustomEvent();
        
        // Output new event.
        console.log( myEvent );
        
        // Output all events after.
        console.log( $e.events.getAll().after );
        
        // Test the event.
        result = $e.run( 'custom-component/example', {
            toggleClass: true,
        } );
        
        // Output command run result.
        console.log( 'e-events-eg-1-result:', result );
		```

   * Register event that runs **_before_** command runs
		```javascript
		// Example of event that toggle the section HTML class.
        export class CreateSectionIsFull extends $e.modules.EventBase.Before {
            getCommand() {
                return 'document/elements/create';
            }
        
            getId() {
                return 'create-section-is-full';
            }
        
            getConditions( args ) {
                const { containers = [ args.container ] } = args;
        
                return containers.some( ( /* Container */ container ) =>
                    'section' === container.model.get( 'elType' )
                );
            }
        
            apply( args ) {
                const { containers = [ args.container ] } = args;
        
                containers.forEach( ( /* Container */ container ) => {
                    if ( 'section' === container.model.get( 'elType' ) ) {
                        container.view.toggleSectionIsFull();
                    }
                } );
            }
        }
		```
> **Note:** further information about [`{CallableBase}`](#CallableBase)**class**.

## API --  `$e.commands`
The new Commands API (since 2.7.0), provides a simple and convenient way to run something the the editor, create a widget, as well as show a notice or undo changes, using JS commands.

The full list of commands, including custom & 3rd commands, is available via: `$e.commands.getAll();`

*  **Description**: `$e.commands` component is a manager of `$e.commands`, allow you to create custom **commands** that runs by `$e.run()`.

*  **Location**: */core/common/assets/js/components/commands.js*

* **Parent**: `elementorModules.Module`

*  **Methods**:

    | Method                          | Access                               | Params                                  | Returns | Description                                                                         |
    |---------------------------------|--------------------------------------|-----------------------------------------|---------|-------------------------------------------------------------------------------------|
    | **getAll**                      | `$e.commands.getAll()`               | `{String}` *command*                    |         | Receive all loaded commands.
    | **register**                    | `$e.commands.register()`             |                                         |         |
    | **getCurrent**                  | `$e.commands.getCurrent()`           |                                         |         | Receive currently running command.
    | **getCurrentArgs**              | `$e.commands.getCurrentArgs()`       |                                         |         | Receive currently running command args.
    | **getCurrentFirstTrace**        | `$e.commands.getCurrentFirstTrace()` |                                         |         | Receive first command in trace that currently running.
    | **isCurrentFirstTrace**         | `$e.commands.isCurrentFirstTrace()`  |                                         |         | Checks if *passed parameter* is the first command in trace that currently running.
    | **run**						  | `$e.commands.run()`                  | `{string}` *command*, `{Object}` *args* |         | Runs a command


# Quickstart
    TODO
