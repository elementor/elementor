###What is a Control?
A control is a tool that allows you to change a certain widget setting. The control settings include all the functional, design and interaction settings that are available for customization by the user.

###The structure of a control
Each control is represented in the system by a class with the type of `Control_Base`.

####`Control_Base` class
Here is the structure of the class:

```php
abstract class Control_Base {

  private $_base_settings = []; // Contains the base control settings. (e.g. whether to show a label, the separator type etc.).

  private $_settings = []; // Contains a merge of the base control settings and the specific type additional settings (e.g. ‘color’ control contains a setting called ‘alpha’, which determines whether to show an alpha slider in the color picker ).

  abstract public function content_template(); //  The control template (See below). Each control has to implement this method.

  abstract public function get_type(); //  The control type. Each control has to implement this method.

  public function __construct() {} //  The control constructor. Each control may override this method or leave its default functionality.

  public function enqueue() {} // If the control need an additional assets libraries (such as JS, CSS etc.), It will be enqueued here.

  public function get_default_value() {} // Determines the default value that the control will return.

  public function get_value( $control, $widget ) {} // Determines how the control returns its value. This method gets a control instance settings and widget instance settings and decides the value will be returned. Each control may override this method or leave its default functionality.

  public function get_style_value( $css_property, $control_value ) {} // Determines how the control returns a style value. (See values types below).

  final public function get_settings( $setting_key = null ) {} // Get whole settings of the control. This method could not be overrided.

  final public function print_template() {} // Prints the control template. This method could not be overrided.

  protected function get_default_settings() {} // Return the specific control type additional settings. Each control may override this method or leave its default (empty).

}
```

###Control settings

####Default settings
Each control has a set of default settings that determine the structure and design of the control, that are displayed while the widget is being edited.

Here is the list of control settings that all control have in common:

- `Label` - The title of the control

- `Default` - The default value

- `Separator` - Sets the position of the separator: `'before'` / `'default'` / `'after'` / `'none'`. *Default*: `'default'`

- `Label_block` - Sets whether to display the title in a separate line: `true` / `false`. *Default*: `false`

- `Show_label` - sets whether to show the title: `true` / `false`. *Default*: true

- `Title` - The title that will appear on mouse over

- `Placeholder` - Available for fields that support placeholder

- `Description` - A description of the field, that appears below the field
