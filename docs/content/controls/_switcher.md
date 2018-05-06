# Switcher
A Switcher control (on/off) - basically a fancy UI representation of a checkbox. Accepts `label_on` and `label_off` for the on/off states, and `return_value` to specify the value returned when checked.

*Returns* `string|empty` Returns the `return_value` if checked or empty if unchecked

## Example

```php
$this->add_control(
	'show_title',
	[
		'label' => __( 'Show Title', 'your-plugin' ),
		'type' => Controls_Manager::SWITCHER,
		'default' => '',
		'label_on' => __( 'Show', 'your-plugin' ),
		'label_off' => __( 'Hide', 'your-plugin' ),
		'return_value' => 'show',
	]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
$settings = $this->get_settings();

if ( 'yes' == $settings['show_title'] ) {
    echo '<h2>' . $settings['title'] . '</h2>';
}
```

**JS:** *(Under `_content_template()` method)*
```html
<# if ( 'yes' === settings.show_title ) { #>
    <h2>{{{ settings.title }}}</h2>
<# } #>
```

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::SWITCHER` | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`label_on`     | no         | *`string`*   | `__( 'Yes', 'elementor' )`   | The label for the "checked" state
`label_off`    | no         | *`string`*   | `__( 'No', 'elementor' )`    | The label for the "unchecked" state
`return_value` | no         | *`string`*   | `yes`                        | The value returned when checked.
`label_block`  | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator