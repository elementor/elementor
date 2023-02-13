## Component -- `$e.components.get('document/history')`

* **Name**: History.
* **Description**: Provide a way to manage editor history, which means - to create and delete history items (milestones), time-travel between them (undo and redo), and starting transactions to be saved as history items.
* **Built in history types**:
    ```javascript
    // Represent history item titles, used in some of the History component commands.
    const historyTypes = {
        "add": "Added",
        "change": "Edited",
        "disable": "Disabled",
        "duplicate": "Duplicate",
        "enable": "Enabled",
        "move": "Moved",
        "paste": "Pasted",
        "paste_style": "Style Pasted",
        "remove": "Removed",
        "reset_style": "Style Reset",
        "reset_settings": "Settings Reset"
    }
    ```
   History component works with few entities:


* **Items**: Primary item which is visible may include sub-items.
* **Sub-Items**: Changes in sub-items are not visible in the primary item, but effects the document in undo/redo.
* **Transactions**: Saves only the first, and the last items of the transactions.


## Component `document/history/` -- Commands
| Command                                                                | Access                                             | Description
|------------------------------------------------------------------------|----------------------------------------------------|-----------------------------------------
| [Do](#command----erundocumenthistroydo)                                | `$e.run('document/history/do')`                    | Do history item.
| [Undo](#command----erundocumenthistroyundo)                            | `$e.run('document/history/undo')`                  | Undo history item.
| [Undo-All](#command----erundocumenthistroyundo-all)                    | `$e.run('document/history/undo-all')`              | Undo all history items.
| [Redo](#command----erundocumenthistroyredo)                            | `$e.run('document/history/redo')`                  | Redo history item.


## Component `document/history/` -- Internal Commands
| Command                                                                     | Access                                              | Description
|-----------------------------------------------------------------------------|-----------------------------------------------------|-----------------------------------------
| [Add-Transaction](#command----einternaldocumenthistroyadd-transaction)      | `$e.internal('document/history/add-transaction')`   | Add transaction item.
| [Clear-Transaction](#command----einternaldocumenthistroyclear-transaction)  | `$e.internal('document/history/clear-transaction')` | Clear transaction.
| [Delete-Log](#command----einternaldocumenthistroydelete-log)                | `$e.internal('document/history/delete-log')`        | Delete log.
| [End-Log](#command----einternaldocumenthistroyend-log)                      | `$e.internal('document/history/end-log')`           | End log.
| [End-Transaction](#command----einternaldocumenthistroyend-transaction)      | `$e.internal('document/history/end-transaction')`   | End transaction.
| [Log-Sub-Item](#command----einternaldocumenthistroylog-sub-item)            | `$e.internal('document/history/log-sub-item')`      | Log sub item.
| [Start-Log](#command----einternaldocumenthistroystart-log)                  | `$e.internal('document/history/start-log')`         | Start log.

## _Command_ -- `$e.run('document/histroy/do')`
*  **Name**: Do.
*  **Description**: Do history step.
*  **Returns**: `{void}`

   | Property     | Type                  | Requirement    | Description |
   |---           |---                    |---             |---|
   | _index_         | `{Number}`         | **optional**   | Index of history item.

## _Command_ -- `$e.run('document/histroy/undo')`
*  **Name**: Undo.
*  **Description**: Undo history step.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.run('document/histroy/undo-all')`
*  **Name**: Undo-All.
*  **Description**: Undo all history steps.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.run('document/histroy/redo')`
*  **Name**: Redo.
*  **Description**: Redo history step.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.internal('document/histroy/add-transaction')`
*  **Name**: Add-Transaction.
*  **Description**: Add item to transactions.
*  **Returns**: `{void}`
*  **Arguments**:

   | Property     | Type                  | Requirement   | Description |
   |---           |---                    |---            |---|
   | _container_  | `{Container}`         | **required**   | Container log.
   | _containers_ | `{Container[]}`       | **required**   | Containers log.
   | _type_       | `{String}`            | **required**   | Type
   | _title_      | `{String}`            | **optional**  | Title.
   | _subTitle_   | `{String}`            | **optional**  | Sub title.
   | _restore_    | `{function()}`        | **optional**  | Restore function.

## _Command_ -- `$e.internal('document/histroy/clear-transaction')`
*  **Name**: Clear-Transaction.
*  **Description**: Clear transactions list.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.internal('document/histroy/delete-log')`
*  **Name**: Delete-Log.
*  **Description**: Delete history item and all sub-items of the item.
*  **Returns**: `{void}`
*  **Arguments**:

   | Property     | Type                  | Requirement   | Description |
   |---           |---                    |---            |---|
   | _id_         | `{Number}`            | **required**  | Id of logged history to delete.

## _Command_ -- `$e.internal('document/histroy/end-log')`
*  **Name**: End-Log.
*  **Description**: End logging history item.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.internal('document/histroy/end-transaction')`
*  **Name**: End-Transaction.
*  **Description**: End transaction, will log the first and the last transaction, as new logged history item.
   title, subTitle will be taken from the first transaction item.
*  **Returns**: `{void}`
*  **Arguments**: None.

## _Command_ -- `$e.internal('document/histroy/log-sub-item')`
*  **Name**: Log-Sub-Item.
*  **Description**: Log sub-item. Each history item can have sub-items (not visualized in the history panel).
*  **Returns**: `{void}`
*  **Arguments**:

   | Property     | Type                  | Requirement    | Description |
   |---           |---                    |---             |---|
   | _id_         | `{Number}`            | **optional**   | Id of history item, to be sub item of. default: `{elementor.documents.currentDocument.history.getCurrentId()}`.
   | _container_  | `{Container}`         | **optional**   | Container log.
   | _containers_ | `{Container[]}`       | **optional**   | Containers log.
   | _type_       | `{String}`            | **optional**   | Type
   | _title_      | `{String}`            | **optional**   | Title.
   | _subTitle_   | `{String}`            | **optional**   | Sub title.
   | _restore_    | `{function()}`        | **optional**   | Restore function.

## _Command_ -- `$e.internal('document/histroy/start-log')`
*  **Name**: Start-Log.
*  **Description**: Start log item.
*  **Returns**: `{Number}` *log id*.
*  **Arguments**:

   | Property     | Type                  | Requirement   | Description |
   |---           |---                    |---            |---|
   | _container_  | `{Container}`         | **required**   | Container log.
   | _containers_ | `{Container[]}`       | **required**   | Containers log.
   | _type_       | `{String}`            | **required**   | Type
   | _title_      | `{String}`            | **required**   | Title.
   | _subTitle_   | `{String}`            | **optional**  | Sub title.
   | _restore_    | `{function()}`        | **optional**  | Restore function.

### [Back](../component.md) 
