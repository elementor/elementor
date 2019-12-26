## API -  `$e.events`
*  **Description**: `$e.events` component is a manager of `$e` _events_, allow you to create custom **logic** that runs *after/before* the command without effect the data *elementor* data model,  history, etc...
the events attached to  `$e.commands`  and each  _event_ being fired after/before  running a command, that runs by  `$e.run()`, Mainly used for UI/View manipulation without affecting the data model.
*  **Location**: *core/common/assets/js/api/apis/events.js*
*  **Parent**: [`{Callbacks}`](#Callbacks)
*  **Methods**:

    | Access                       | Params                                                   | Returns                | Description
    |------------------------------|----------------------------------------------------------|------------------------|----------------------------------------------------------------|
    | `$e.events.registerAfter()`  | `{CallableBase}` *instance*                              | `{object}` *callback*  | Register a event that being fired after the command runs.
    | `$e.events.registerBefore()` | `{CallableBase}` *instance*                              | `{object}` *callback*  | Register a event that being fired before the command runs.
    | `$e.events.runAfter()`       | `{string}` *command*, `{object}` *args*, *result*        |                        | Runs event after.
    | `$e.events.runBefore()`      | `{string}` *command*, `{object}` *args*                  |                        | Runs before dependency.

	> **Note:** Please look at parent: `{Callbacks}` for all the methods.
 
  * ***Important***: All hooks should be created by extending [`{( EventAfter | EventBefore )}`](#EventAfter-EventBefore) located at:
    * `core/common/assets/js/api/modules/event-base/after.js`
    * `core/common/assets/js/api/modules/event-base/dependency.js`
 * **Examples**:
   * Built in events:  *`assets/dev/js/editor/document/callback/events`*
   * Register event that runs **_after_** command runs:

        ```javascript
        // Example of event after the command runs and change ( CSS Class ) of all div elements.
        // Important: Available to run in the console but depends on $e.components example#1.
        
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
  
### [Back](readme.md) 
