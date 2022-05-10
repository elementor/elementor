# Elementor Nested-Elements Module
## Introduction

* **Experiment:** `true`
* **Module Description** - is a module that allows you to created nested widgets, widgets inside widgets.
- 📂 __nested\-elements__
    - 📂 __assets__
        - 📂 __js__
            - 📂 __editor__
                - 📄 [component.js](assets/js/editor/component.js)
                - 📄 [index.js](assets/js/editor/index.js)
                - 📄 [module.js](assets/js/editor/module.js)
                - 📂 __nested\-repeater__
                    - 📄 [component.js](assets/js/editor/nested-repeater/component.js)
                    - 📂 __controls__
                        - 📄 [repeater.js](assets/js/editor/nested-repeater/controls/repeater.js)
                    - 📂 __hooks__
                        - 📂 __data__
                            - 📄 [base.js](assets/js/editor/nested-repeater/hooks/data/base.js)
                            - 📂 __document__
                                - 📂 __elements__
                                    - 📂 __create__
                                        - 📄 [nested\-repeater\-adjust\-container\-titles.js](assets/js/editor/nested-repeater/hooks/data/document/elements/create/nested-repeater-adjust-container-titles.js)
                                - 📂 __repeater__
                                    - 📂 __insert__
                                        - 📄 [nested\-repeater\-create\-container.js](assets/js/editor/nested-repeater/hooks/data/document/repeater/insert/nested-repeater-create-container.js)
                                    - 📂 __remove__
                                        - 📄 [nested\-repeater\-remove\-container.js](assets/js/editor/nested-repeater/hooks/data/document/repeater/remove/nested-repeater-remove-container.js)
                        - 📄 [index.js](assets/js/editor/nested-repeater/hooks/index.js)
                        - 📂 __ui__
                            - 📂 __panel__
                                - 📂 __editor__
                                    - 📂 __open__
                                        - 📄 [nested\-repeater\-focus\-current\-edited\-container.js](assets/js/editor/nested-repeater/hooks/ui/panel/editor/open/nested-repeater-focus-current-edited-container.js)
                    - 📂 __models__
                        - 📄 [nested\-model\-base.js](assets/js/editor/nested-repeater/models/nested-model-base.js)
                    - 📂 __views__
                        - 📄 [nested\-view\-base.js](assets/js/editor/nested-repeater/views/nested-view-base.js)
    - 📂 __base__
        - 📄 [widget\-nested\-base.php](base/widget-nested-base.php)
    - 📂 __controls__
        - 📄 [control\-nested\-repeater.php](controls/control-nested-repeater.php) - `Nested repeater control, for management of nested repeater, to able run $e.run( 'document/repeater/select )  - for each selected tab in panel`
    - 📄 [module.php](module.php)
- --------------------------------------------------------------------------------------------------------------------------------

## How to consume the module?
>  [__TabsV2__](../tabs-v2/index.md) documentation is explaining about how to use NestedElements.

#  What inside?
> [__Nested Elements__](#) is a base module for all nested elements, it includes the infrastructure for creating nested elements.

Simple explanation about the files and their purpose:
- --------------------------------------------------------------------------------------------------------------------------------

## `assets/js/component.js.`
###`nested-elements` component.
* **Link to the actual file** - [component.js](../../../modules/nested-elements/assets/js/editor/component.js)
* **Description** - The component does two things:
    - Registers `nested-elements/nested-repeater` component.
    - Have the method 'isWidgetSupportNesting' that returns true if the widget supports nesting.

## `assets/js/editor/index.js`
### The first file that loaded for the editor javascript.
* **Link to the actual file** - [index.js](../../../modules/nested-elements/assets/js/editor/index.js)
* **Description** - Loads the editor module, and tells when its loaded, since the other dependant modules are depends on __Nested Elements__ module.
    - Import the editor(`editor.js`) module.
    - Save the import promise in the global variable(`elementor.modules.nestedElements`).
    - After loading replace the promise with the actual loaded file.


## `assets/js/editor/module.js` 
### The first file that loaded for the editor javascript.
* **Link to the actual file** - [module.js](../../../modules/nested-elements/assets/js/editor/module.js)
* **Description** - Register `nested-elements` component.

## `assets/js/nested-repeater/component.js` - `nested-elements/nested-repeater`
### Component that includes all the functionality that crossing nested repeater logic.
* **Link to the actual file** - [component.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/component.js)
* **Description** - 
  - The component exports the `NestedModelBase` and `NestedViewBase` classes.
  - Register custom control `nested-elements-repeater` for handling the tab selection via dedicated command. (`document/repeater/select`).
  - Register the infrastructure hooks.
  - Have the method `getChildrenTitle()` that returns the default title for the nested repeater.

## `assets/js/nested-repeater/controls/repeater.js`
### Custom repeater control.
* **Link to the actual file** - [control.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/controls/repeater.js)
* **Description** -  The control responsible for two things:
    - Get the default title for children titles(__Custom__ `tab_title`).
    - Change the functionality of selecting repeater items to use the dedicated command (`document/repeater/select`).

## `assets/js/nested-repeater/hooks/base.js`
### Base hooks for the nested repeater.
* **Link to the actual file** - [base.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js)
* **Description** - Is a __base__ hook for all the __data__ hooks in nested repeater component. The hook includes 2 base conditions:
- 
	```javascript
	  getContainerType() {
		  return 'widget';
	  }
	```
-
	```javascript
	getConditions( args ) {
		return $e.components.get( 'nested-elements' ).isWidgetSupportNesting( args.container.model.get( 'widgetType' ) );
	}
	```
  1. The container type sould be `widget`
  2. The widget should support nesting.
  
	> The next files will be about the __data__ hooks they will use this [__base.js__](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/base.js).

## `nested-repeater-adjust-container-titles.js` 
### Adjust the nested children titles.
* **Link to the actual file** - [nested-repeater-adjust-container-titles.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/elements/create/nested-repeater-adjust-container-titles.js)
* **Description** - Adjust the nested children titles, flow: 
  * For each nested repeater container, set the children container title,
  * According to the nested repeater item title, e.g: the result will be `Tab #1`, `Tab #2` and so on instead of `Container`.
  * `_title` is used by the navigator.

## `nested-repeater-create-container.js` 
### Create container children for each created repeater item. 
* **Link to the actual file** - [nested-repeater-create-container.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/insert/nested-repeater-create-container.js)
* **Description** - The hook called when the repeater item is created, and create container in the widget for that item.

## `nested-repeater-remove-container.js` 
### Remove container children for each created repeater item.
* **Link to the actual file** - [nested-repeater-remove-container.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/data/document/repeater/remove/nested-repeater-remove-container.js)
* **Description** - The hook called when the repeater item is removed, will delete child container from widget for the corresponding item.
	> The 2 Hooks above exist to enable control over child container creation and deletion, using the next UI.
    
	![img](_images/1.jpeg)

## `nested-repeater-focus-edited-container.js` 
### Focus the edited container hierarchy.
https://user-images.githubusercontent.com/10234691/166414693-5687c27e-0ef4-48fa-8253-bc09f2db2cf9.mov
* **Link to the actual file** - [nested-repeater-focus-edited-container.js](../../../modules/nested-elements/assets/js/editor/nested-repeater/hooks/ui/panel/nested-repeater-focus-edited-container.js)
