## API - `$e.hooks`
*  **Description**: `$e.hooks` api is a manager of `$e.hooks`, allow you to create custom **data manipulation** of *elementor* data model, and create a dependencies, the _hooks_ attached 
to  `$e.commands`  and each  **hook** being fired after/before running a command, that runs by  `$e.run()`
*  **Location**: *core/common/assets/js/api/apis/hooks.js*
*  **Parent**: [`{Callbacks}`](#Callbacks)
*  **Methods**:

	| Method                          | Params                                                   |  Returns              | Description                                              
	|---------------------------------|----------------------------------------------------------|-----------------------|-----------------------------------------------------------
	| `$e.hooks.registerAfter()`      | `{CallableBase}` *instance*                              | `{object}` *callback* | Register a hook that being fired after the command runs.  
	| `$e.hooks.registerDependency()` | `{CallableBase}` *instance*                              | `{object}` *callback* | Register a hook that being fired before the command runs.
	| `$e.hooks.runAfter()`           | `{string}` *command*, `{object}` *args*, *result*        |                       | Runs hook after.
	| `$e.hooks.runDependency()`      | `{string}` *command*, `{object}` *args*                  |                       | Runs hook dependency.

	> **Note:** Please look at parent: `{Callbacks}` for all the methods.
 
  * ***Important***: All hooks should be created by extending [`{( HookAfter | HookDependency )}`](#HookAfter-HookDependency) located at:
    * `core/common/assets/js/api/modules/hook-base/after.js`
    * `core/common/assets/js/api/modules/hook-base/dependency.js`

*  **Examples**:
   * Built in hooks: *`assets/dev/js/editor/document/callback/hooks`*

   * Register hook **_after_** command runs:
        ```javascript
        // Example of hook after the command runs.
        // Important: Available to run in the console but depends on $e.components example#1.
        
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
  
### [Back](readme.md) 
