# Elementor TabsV2 Module
## Introduction

* **Experiment:** `true`
* **Module Description** - Module that allows you to create nested tabs widget.
* **Depends** - on `\Elementor\Modules\NestedElements\Module`
- 📂 __tabs\-v2__
	- 📂 __assets__
		- 📂 __js__
			- 📂 __editor__
				- 📄 [index.js](#assetsjseditorindexjs---load-the-module) - `The first files to be loaded in the editor, tells the editor to load the module.`
				- 📄 [module.js](#assetsjseditormodulejs---the-module-register-the-widget) - `Load the widget and register it to editor elementsManager., wait for NestedElements module to be loaded first!.`
				- 📄 [tabs\-v2.js](#assetsjseditortabs-v2js---register-the-widget) - `Register the widget in the editor.`
				- 📂 __views__
					- 📄 add\-section\-area.js - `React component that renders the add section area, rendered via empty.js`
					- 📄 [empty.js](#assetsjseditorviewsemptyjs---custom-empty-view-for-the-widget) - `React component, that will be rendered when the widget is empty, prints select-preset or add-section-area.`
					- 📄 select\-preset.js `React component that Render  the preset for children container.`
					- 📄 [view.js](#assetsjseditorviewsviewjs---custom-view-for-the-widget) - `The widget view, actually used to manipulate clicks on the widget (view), register the model, view. emptyView for the widget.`
			- 📂 __frontend__
				- 📂 __handlers__
					- 📄 [tabs\-v2.js](assets/js/frontend/handlers/tabs-v2.js) - `Frontend handler(s), custom handlers for interacting with the widget.`
		- 📂 __scss__
			- 📄 [frontend.scss](assets/scss/frontend.scss) - `All CSS will be used in frontend, how visually the widget will looks`
	- 📄 [module.php](#assetsjseditormodulejs---the-module-register-the-widget) - `The module, enable the experiment to work on/off, register editor scripts`
	- 📂 __widgets__
		- 📄 [tabs\-v2.php](#widgetstabs-v2php---how-to-register-a-widget) - `Backend, The widget that will be nested, insert new widget into the system.`

> Minimum requirement are `module.php` `tabs-v2.js` and `tabs-v2.php`
- --------------------------------------------------------------------------------------------------------------------------------

# How NestedElements, TabsV2 (Nested tabs) works?
* The module [__TabsV2__](../../../modules/tabs-v2/) will be used as live example of the guide.
* What are the difference between __TabsV2__ and __Nested Elements__ modules? 
  > __Nested Elements__ is a base module for all nested elements, it includes the infrastructure for creating nested elements.

  > __TabsV2__ is a module that allows you to created nested tabs.

  * __TabsV2__ module includes:
    * Editor scripts:
        * Widget: __TabsV2__ 
        * Custom Views: 
            * __View__ `modules/tabs-v2/assets/js/editor/views/view.js` - The actual view of the widget.
        * Custom Empty widget views:
            * __Empty View__ `modules/tabs-v2/assets/js/editor/views/empty.js` - The view that will be rendered when the widget is empty.
            * __Select Preset View__ `modules/tabs-v2/assets/js/editor/views/select-preset.js` - will be rendered when select preset is selected.
            * __Add Section Area View__ `modules/tabs-v2/assets/js/editor/views/add-section-area.js` - The default that will be renderd on the __Empty View__.
    * Frontend scripts:
        * __TabsV2__ Handler `modules/tabs-v2/assets/js/frontend/handlers/tabs-v2.js`
    * Frontend styles:
        * __TabsV2__ Styles `modules/tabs-v2/assets/scss/frontend.scss`
    * Backend Widget:
        * __TabsV2__ Widget registration `modules/tabs-v2/widgets/tabs-v2.php`

The following guide will help you to understand how the module works, step by step.

Let start by registering the module:

## `- Module.php` - How to register a module.
* **Link to the actual file** - [module.php](../../../modules/tabs-v2/module.php)
* **Description** - Registers the experiment on/off, register editor scripts
* **Extends** - `\Elementor\Core\Base\Module`

How to register a module?
* Since __TabsV2__ (nested tabs) depends on `NestedElements` module, 
   - use `get_experimental_data` method is used to notify the module dependency upon `NestedElementsModule`. Please see `'dependencies'` key.
    ```php
    use Elementor\Modules\NestedElements\Module as NestedElementsModule;
  
    public static function get_experimental_data() {
        return [
            'name' => 'tabs-v2',
            'title' => esc_html__( 'Nested Tab', 'elementor' ),
            'description' => esc_html__( 'Nested Tabs', 'elementor' ),
            'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
            'default' => Experiments_Manager::STATE_INACTIVE,
            'dependencies' => [ NestedElementsModule::class ],
        ];
    }
    ```
* Loading the editor scripts.
  ```php
  public function __construct() {
        add_action( 'elementor/editor/before_enqueue_scripts', function () {
            // The script you load for the editor goes here.
            wp_enqueue_script( 'tabs-v2', $this->get_js_assets_url( 'tabs-v2' ), [
                'elementor-common',
            ], ELEMENTOR_VERSION, true );
        } );
  }
    ```
  * Does it is a requirement for creating nested widgets?
    * Yes, it is, since nested elements are required different `Model` to allow child to be another widget. 

* To register the widget, extend the `get_widgets` method in the `Module` and return the widget name, eg:
  ```php
  protected function get_widgets() {
      return [ 'TabsV2' ]; // Located at widgets/tabs-v2.php (the file will be loaded automatically).
  }
  ```
* The complete module
  ```php
  <?php
  namespace Elementor\Modules\TabsV2;
	
  use Elementor\Core\Experiments\Manager as Experiments_Manager;
  use Elementor\Modules\NestedElements\Module as NestedElementsModule;
	
  class Module extends \Elementor\Core\Base\Module {
	
      public static function get_experimental_data() {
          return [
              'name' => 'tabs-v2',
              'title' => esc_html__( 'Nested Tab', 'elementor' ),
              'description' => esc_html__( 'Nested Tabs', 'elementor' ),
              'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
              'default' => Experiments_Manager::STATE_INACTIVE,
              'dependencies' => [ NestedElementsModule::class ],
          ];
      }
	
      public function get_name() {
          return 'tabs-v2';
      }
	
      protected function get_widgets() {
          return [ 'TabsV2' ];
      }
	
      public function __construct() {
          parent::__construct();
	
          add_action( 'elementor/editor/before_enqueue_scripts', function () {
              wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
                  'nested-elements',
              ], ELEMENTOR_VERSION, true );
          } );
      }
  }
  ```
## `widgets/tabs-v2.php` - How to register a widget.
* **Link to the actual file** - [tabs-v2.php](../../../modules/tabs-v2/widgets/tabs-v2.php)
* **Description** - The `widgets/tabs-v2.php` is main backend configuration file for widget with nested captabilties.
* **Extends** - [`\Elementor\Modules\NestedElements\Base\Widget_Nested_Base`](#)

* Requirements:
	* Before creating a __Widget__ you have to be familiar with the [simple widget creation process](https://developers.elementor.com/docs/widgets/).
* Is it requirement? 
    * Yes, in other words its simply the widget registration, including few abstract methods that are that explained in the next section.
* The class should extend `Widget_Nested_Base` class, there are few important methods to note:
  * `get_default_children_elements` - The inner children/elements that will be created when the widget is created.
  * `get_default_repeater_title_setting_key` - The setting key that will be used by `$e.run( 'document/elements/settings' )` in the frontend for the children title.
  * `get_defaults_children_title` - The tab title including `%d` for the index.
  * `get_default_children_placeholder_selector` - Custom selector to place the children, in __TabsV2__ is used inside the tabs content. return `null` if the element should be added in the end of the element.

  ```php
  <?php
  namespace Elementor\Modules\TabsV2\Widgets;
	
  use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
  use Elementor\Plugin;
	
  class TabsV2 extends Widget_Nested_Base {
      protected function get_default_children_elements() {
              return [
              [
                  'elType' => 'container',
                  'settings' => [
                      '_title' => __( 'Tab #1', 'elementor' ),
                  ],
              ],
              [
                  'elType' => 'container',
                  'settings' => [
                      '_title' => __( 'Tab #2', 'elementor' ),
                  ],
              ],
          ];
      }
	
      protected function get_default_repeater_title_setting_key() {
          return 'tab_title';
      }
	
      protected function get_defaults_children_title() {
          return esc_html__( 'Tab #%d', 'elementor' );
      }
	
      protected function get_default_children_placeholder_selector() {
          return '.elementor-tabs-content-wrapper';
      }
	
      protected function get_html_wrapper_class() {
          return 'elementor-widget-tabs-v2';
      }
  }
  ```
  
## `assets/js/editor/index.js` - Load the module.
* **Link to the actual file** - [index.js](../../../modules/tabs-v2/assets/js/editor/index.js)

* This is first loaded file in the editor.
  * What it does? Await for `Nested Elements` module to be loaded (requirement since the TabsV2 depends on the Nested Elements module).
  * Load the __TabsV2__ module.
      ```javascript
      // On editor init components.
      elementorCommon.elements.$window.on( 'elementor/init-components', async () => {
          // The module should be loaded only when `nestedElements` is available.
          await elementor.modules.nestedElements;
	
          // Create the TabsV2 moodule.
          new ( await import( '../editor/module' ) ).default();
      } );
      ```
## `assets/js/editor/module.js` - The module register the widget.
* **Link to the actual file** - [module.js](../../../modules/tabs-v2/assets/js/editor/module.js)

* What the modules do? Register the widget only.
* What are the advantages of registering the element in the `elmeentor.elementsManager`?
  * Enable the option to customize the `View, EmptyView, or Model`
	
  ```javascript
    import TabsV2 from './tabs-v2'; // Import the widget.
	
    export default class Module {
        constructor() {
            // Register new TabsV2 widget.
            elementor.elementsManager.registerElementType( new TabsV2() );
        }
    }
    ```
    * The registration required for creating widgets with custom view, models, or custom empty-view.
## `assets/js/editor/tabs-v2.js` - Register the widget.
* **Link to the actual file** - [tabs-v2.js](../../../modules/tabs-v2/assets/js/editor/tabs-v2.js)
* The minimum requirement for nested capabilities is having a model support nested elements(elements inside elements), and can be done by registering this class:
  ```javascript
  export class YourWidgetName extends elementor.modules.elements.Widget {
      getModel() {
          // Includes the nested model with support of nested elements.
          return $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedModelBase;
      }
  }
  ```
* More advance example of registering the widget and manipulate the views.
    ```javascript
    import View from './views/view';            // Custom view for handling the clicks.
    import EmptyView from './views/empty';      // Customn empty view for handling empty in the widget.
	
    export class TabsV2 extends elementor.modules.elements.types.Base {
        getType() {
              return 'tabs-v2'; // Widget type from the backend registeration.
        }
	
        getView() {
             // Custom-View for the element should extend `$e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase`.
            return View;
        }
	
        getEmptyView() {
             // Custom empty-view for the widget should be `React` component.
            return EmptyView;
        }
	
        getModel() {
            // Should extend `$e.components.get( 'nested-elements/nested-repeater' ).exports.NestedRepeaterModel`.
            // In this senario, custom model is not required so default is returned.
            return $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedModelBase;
        }
    }
	
    export default TabsV2;
	
    ```
## `assets/js/editor/views/view.js` - Custom view for the widget.
* **Link to the actual file** - [view.js](../../../modules/tabs-v2/assets/js/editor/views/view.js)
* The view should extend `$e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase`, let use __TabsV2__ view as exmaple:
	```javascript
	/**
	 * @extends {NestedViewBase}
	 */
	export class View extends $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase {
		events() {
			const events = super.events();
	
			events.click = ( e ) => {
				const closest = e.target.closest( '.elementor-element' );
	
				let model = this.options.model,
					view = this;
	
				// For clicks on container.
				if ( 'container' === closest?.dataset.element_type ) { // eslint-disable-line camelcase
					// In case the container empty, click should be handled by the EmptyView.
					const container = elementor.getContainer( closest.dataset.id );
	
					if ( container.view.isEmpty() ) {
						return true;
					}
	
					// If not empty, open it.
					model = container.model;
					view = container.view;
				}
	
				e.stopPropagation();
	
				$e.run( 'panel/editor/open', {
					model,
					view,
				} );
			};
	
			return events;
		}
	}
	
	export default View;
	```
     - The view logic is handles the clicks on the widget, thats what it used in this senario, if there is no custom logic, the default nested view can be used:
       - `$e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase`.
## `assets/js/editor/views/empty.js` - Custom empty-view for the widget.
* **Link to the actual file** - [empty.js](../../../modules/tabs-v2/assets/js/editor/views/empty.js)

* The view should be `React` component, it will be the empty view for the widget children, in this case, the tabs.
    ```javascript
    import { useState } from 'react';
	
    import AddSectionArea from './add-section-area';
    import SelectPreset from './select-preset';
	
    export default function Empty( props ) {
        const [ isRenderPresets, setIsRenderPresets ] = useState( false );
	
        props = {
            ...props,
            setIsRenderPresets,
        };
	
        return isRenderPresets ? <SelectPreset {...props} /> : <AddSectionArea {...props} />;
    }
	
    Empty.propTypes = {
        container: PropTypes.object.isRequired,
    };
	
    ```
	- This component determine which component to print `SelectPreset` or `AddSectionArea`.


# TBD
-- Show minimal requirement for createing new widget, separate the extra from the main.
-- then go into the detials.

- !! Add select-preset and add-section-area.

- !! Register frontend handler.

- !! Data binding.

-- GO Step by step to ensure you successfully create a new widget.

-- Ensure https://gist.github.com/iNewLegend/c50e629f10de1db16a099509a325e324 - looks good on github.

>  For more information about __Nested Elements__, please see [Nested Elements Module](#.)



