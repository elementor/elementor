# Checkbox
A simple checkbox.

*Returns* `string|empty` Returns the string `on` if checked or empty if unchecked

## Example

```php
$this->add_control(
	'show_title',
	[
		'label' => __( 'Show Title', 'your-plugin' ),
		'type' => Controls_Manager::SWITCHER,
		'default' => '',
	]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
$settings = $this->get_settings();

if ( 'on' == $settings['show_title'] ) {
    echo '<h2>' . $this->get_settings( 'title' ) . '</h2>';
}
```

**JS:** *(Under `_content_template()` method)*
```html
<# if ( 'on' === settings.show_title ) { #>
    <h2>{{{ settings.title }}}</h2>
<# } #>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------  | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::CHECKBOX` | The type of the control
`default`      | no         | *`string`*   | `''`                         | Set default to `on` to set as checked
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator