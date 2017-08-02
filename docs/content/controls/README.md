# Controls Introduction
 
### Table of Contents
* [What is a Control?](#what-is-a-control)
* [The structure of a control](#the-structure-of-a-control)
  - [`Base_Control` class](#base_control-class)
* [Control settings](#control-settings)
  - [Default settings](#default-settings)
  - [Settings Hierarchy](#settings-hierarchy)
* [Control structure types](#control-structure-types)
  - [Multiple control](#multiple-control)
* [Adding a control to an element](#adding-a-control-to-an-element)
* [Reference](#reference)

### What is a Control?
A control is a tool that allows you to change a certain widget setting. The control settings include all the functional, design and interaction settings that are available for customization by the user.

### The structure of a control
Each control is represented in the system by a class with the type of `Base_Control`.

#### `Base_Control` class
Here is the structure of the class:

```php
abstract class Base_Control {
  // Contains the base control settings. (e.g. whether to show a label, the separator type etc.).
  private $_base_settings = [];

  // Contains a merge of the base control settings and the specific type additional settings.
  // (e.g. 'color' control contains a setting called 'alpha',
  // which determines whether to show an alpha slider in the color picker ).
  private $_settings = [];

  // The control template (See below). Each control has to implement this method.
  abstract public function content_template();

  // The control type. Each control has to implement this method.
  abstract public function get_type();

  // The control constructor. Each control may override this method or leave its default functionality.
  public function __construct() {}

  // If the control need an additional assets libraries (such as JS, CSS etc.),
  // It will be enqueued here.
  public function enqueue() {}

  // Determines the default value that the control will return.
  public function get_default_value() {}

  // Determines how the control returns its value.
  // This method gets a control instance settings and widget instance settings
  // and decides the value will be returned.
  // Each control may override this method or leave its default functionality.
  public function get_value( $control, $widget ) {}

  // Determines how the control returns a style value. (See values types below).
  public function get_style_value( $css_property, $control_value ) {}

  // Get whole settings of the control. This method could not be overrided.
  final public function get_settings( $setting_key = null ) {}

  // Prints the control template. This method could not be overrided.
  final public function print_template() {}

  // Return the specific control type additional settings.
  // Each control may override this method or leave its default (empty).
  protected function get_default_settings() {}

}
```

### Control settings

#### Default settings
Each control has a set of default settings that determine the structure and design of the control, that are displayed while the widget is being edited.

Here is the list of control settings that all control have in common:

* `label` - The title of the control

* `default` - The default value

* `separator` - Sets the position of the separator: `'before'` / `'default'` / `'after'` / `'none'`. *Default*: `'default'`

* `label_block` - Sets whether to display the title in a separate line: `true` / `false`. *Default*: `false`

* `show_label` - sets whether to show the title: `true` / `false`. *Default*: `true`

* `title` - The title that will appear on mouse over

* `placeholder` - Available for fields that support placeholder

* `description` - A description of the field, that appears below the field

#### Settings Hierarchy
In addition to the default settings that come with the basic control, each control can be added with its own default settings, and can also have settings that override the default class.

In addition, with every addition of a control to a widget, you can send another set of settings that will override the entire default settings. Here is an example:

Default settings in the base class:

```php
abstract class Base_Control {

  // here is some base default settings
  private $_base_settings = [
     'separator' => 'default',
     'label' => '',
     'label_block' => false,
  ];
}
```

Default settings in the 'Choose' class:

```php
class Control_Choose extends Base_Control {

 // here is some base default settings set by the `choose` control
  protected function get_default_settings() {
     return [
        'options' => [],
        'label_block' => true,
        'toggle' => true,
     ];
  }
}
```

Adding a 'choose' control to a widget:

```php
class Widget_Fake extends Widget_Base {

  protected function _register_controls() {

     // Adding 'choose' control with additional settings
     $this->add_control(
        'alignment',
        [
           'label' => __( 'Alignment', 'your-plugin' ),
           'type' => Controls_Manager::CHOOSE,
           'toggle' => false,
        ]
     );
  }
}
```

The current control settings for this example would be:

```php
[
    'separator' => 'default', // Added by the base control
    'label' => __( 'Alignment', 'your-plugin' ), // Added from the widget settings
    'label_block' => true, // Overriden by the `choose` control
    'options' => [], // Added by the `choose` control
    'toggle' => false, // Overriden from the widget settings
    'type' => Controls_Manager::CHOOSE, // Added from the widget settings
]
```

### Control structure types

By default, the value that the control returns is represented as a string or number (for example, a possible value for a 'color' control would be `#f7f7f7`). However, some controls return more than one value, and require a different way of handling.

#### Multiple Control
A multiple control is a control that returns more than a single value. The returned values by such a control are represented by an array.

For example, the value returned by a 'media' control can look like this:

```php
[
   'id' => 123,
   'url' => 'http://some-domain.com/media/awesome-image.png'
]
```

Each multiple control is inherited from the abstract class `Control_Base_Multiple`, that inherits from the `Base_Control` class.

### Adding a control to an element
To learn how to add a control to an element, go to the next part: [Controls and the Editor](controls-and-the-editor.md).

### Reference
A full list of available controls, can be found in [this article](reference.md).