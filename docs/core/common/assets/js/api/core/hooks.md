## API - `$e.hooks`
*  **Description**: `$e.hooks` api is a manager of `$e.hooks.ui` & `$e.hooks.data`, allow you to create custom hooks.
the hooks attached to $e.commands and each hook being fired after/before running a command, that runs by $e.run().
*  **Location**: *core/common/assets/js/api/core/hooks.js*
*  **Methods**:

	| Method                               | Params                                                                                          |  Returns              | Description                                              
	|--------------------------------------|-------------------------------------------------------------------------------------------------|-----------------------|-----------------------------------------------------------
	| `$e.hooks.activate()`                |                                                                                                 |                       | Activate all hooks. 
	| `$e.hooks.deactivate()`              |                                                                                                 |                       | Deactivate all hooks. 
	| `$e.hooks.getAll()`                  |                                                                                                 | `{Array}`             | Receive all loaded hooks. 
	| `$e.hooks.register()`                | `{String}` *type*, `{String}` *event*, `{HookBase}` *instance*                                  | `{Object}` *callback* | Register hook. 
	| `$e.hooks.run()`                     | `{String}` *type*, `{String}` *event*, `{String}` *command*, `{Object}` *args*, `{*}` *result*  | `{Boolean}`           | Run's a hook. 
	| `$e.hooks.registerDataAfter()`       | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register data hook that's run after the command.  
	| `$e.hooks.registerDataCatch()`       | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register data hook that's run when the command fails.  
	| `$e.hooks.registerDataDependency()`  | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register data hook that's run before the command as dependency.  
	| `$e.hooks.registerUIAfter()`         | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register UI hook that's run after the commands run.  
	| `$e.hooks.registerUICatch()`         | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register UI hook that's run when the command fails.  
	| `$e.hooks.registerUIBefore()`        | `{HookBase}` *instance*                                                                         | `{Object}` *callback* | Register UI hook that's run before the command.  
	| `$e.hooks.runDataAfter()`            | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run data hook that's run after the command.
	| `$e.hooks.runDataCatch()`            | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run data hook that's run when the command fails.
	| `$e.hooks.runDataDependency()`       | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run data hook that's run before the command as dependency.
	| `$e.hooks.runUIAfter()`              | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run UI hook that's run after the commands run.
	| `$e.hooks.runUICatch()`              | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run UI hook that's run when the command fails.
	| `$e.hooks.runUIBefore()`             | `{String}` *command*, `{Object}` *args*, `{*}` *result*                                         | `{Boolean}`           | Run UI hook that's run before the command.
    > **Note:** further information about can be found at [`{$e.hooks.ui}`](hooks/ui.md) and [`{$e.hooks.data}`](hooks/data.md)

  
### [Back](../readme.md) 
