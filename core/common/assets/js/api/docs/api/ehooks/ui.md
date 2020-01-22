## API -  `$e.hooks.ui`
*  **Description**: `$e.hooks.ui` api is manager of _UI_ hooks, allow you to create custom **logic** 
that runs *after/before/catch* the command without effect the data *elementor* data model and history,
the hooks attached to `$e.commands` and each  _event_ being fired when command is running.
Mainly used for UI/View manipulation.
*  **Location**: *core/common/assets/js/api/core/hooks/ui.js*
*  **Parent**: [`{HooksBase}`](#HooksBase)
*  **Methods**: Please look at parent: `{HooksBase}` for all the methods.
* ***Important***: All hooks should be created by extending [`{( $e.modules.hookUI )}`](#e-modules-hooks-ui) located at: `core/common/assets/js/api/modules/hooks/ui/`.
	
	| Class                           | Description                                                                                            
	|---------------------------------|--------------------------------------------------------------------------------
	| `$e.modules.hookUI.Base`        | Naked base for creating custom UI hooks.                   
	| `$e.modules.hookUI.After`       | Used to create a hook, runs after command being executed.
	| `$e.modules.hookUI.Before`      | Used to create a hook, runs before command being executed.
	| `$e.modules.hookUI.Catch`       | Used to create a hook, runs when command failed.
 
 * **Examples**:
   * Built in hooks:  *`assets/dev/js/editor/document/hooks/data`*
   * Register UI hook that runs **_after_** command runs:

        ```javascript
        // Example of UI hook, fired after the command runs and change ( CSS Class ) of all div elements.
        // Important: Available to run in the console but depends on $e.components example#1. ( TODO ADD LINK )
        
        class CustomUIHook extends $e.modules.hookUI.After {
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
        
        // Add new event to `$e.hooks.ui`;
        const myHook = new CustomUIHook();
        
        // Output new event.
        console.log( myHook );
        
        // Output all events after.
        console.log( $e.hooks.ui.getAll().after );
        
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
    class CreateSectionIsFull extends $e.modules.hookUI.Before {
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
> **Note:** further information about [`{CallableBase}`](../module/module---internal-callable-base.md)**class**.
  
### [Back](../readme.md) 
