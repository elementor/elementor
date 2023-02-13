# Elementor JS `$e`  API
## Introduction

**Elementor JS API** - is set of *API(s)*, *modules*, *components*, and *utils*, used to communicating with *elementor*.
 represented as `$e` - Global Variable.

# Overview
| API Name                                              | Access          | Description                    |
|-------------------------------------------------------|-----------------|--------------------------------|
| [Commands](core/commands.md)                          | `$e.commands`   | Commands management.
| [Components](core/components.md)                      | `$e.components` | Components management.
| [Data](core/data.md)                                  | `$e.data`       | Data ( Restful API ) Commands management.
| [Hooks](core/hooks.md)                                | `$e.hooks`      | Hooks.
| [UI-States](core/ui-states.md)                        | `$e.uiStates`   | UI State manager.
| Routes                                                | `$e.routes`     | Routes management.   
| Shortcuts                                             | `$e.shortcuts`  | Shortcuts component.      
| DevTools                                              | `$e.devTools`   | External plugin for developers. 


# Aliases
| Alias           | Original                    | Description			    |
|-----------------|-----------------------------|---------------------------|
| `$e.run()`      | `$e.commands.run()`         | Run command.              |
| `$e.internal()` | `$e.commandsInternal.run()` | Run internal command.     |
| `$e.route()`    | `$e.routes.run()`           | Run route ( open route ). |

