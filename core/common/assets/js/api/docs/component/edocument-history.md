
## Component -- `$e.components.get('document/history')`

*  **Name**: History.
*  **Description**: Provide a way to manage history...

## Component `document/history/` -- Commands
| Command                                                                | Access                                             | Description         
|------------------------------------------------------------------------|----------------------------------------------------|-----------------------------------------
| [Add-Transaction](#)                                                   | `$e.run('document/history/add-transaction')`       | 
| [Delete-Log](#)                                                        | `$e.run('document/history/delete-log')`            | 
| [Delete-Transaction](#)                                                | `$e.run('document/history/delete-transaction')`    | 
| [End-Transaction](#)                                                   | `$e.run('document/history/end-transaction')`       | 
| [Log-Sub-Item](#)                                                      | `$e.run('document/history/log-sub-item')`          | 
| [Start-Log](#)                                                         | `$e.run('document/history/start-log')`             | 
| [Start-Transaction](#)                                                 | `$e.run('document/history/start-transaction')`     | 
| [Undo](#)                                                              | `$e.run('document/history/undo')`                  | 
| [Undo-All](#)                                                          | `$e.run('document/history/undo-all')`              | 
| [Redo](#)                                                              | `$e.run('document/history/redo')`                  | 

## AddTransaction _Command_ -- `$e.run('document/histroy/add-transaction')`
*  **Name**: Add-Transaction.
*  **Description**: Add item to transactions.
*  **Returns**: `{void}`
*  **Arguments**: 
