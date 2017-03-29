# Select2
A select field based on the select2 plugin. Accepts an `array` of `options` in which the `key` is the value and the `value` is the option name. Set `multiple` to `true`, to allow multiple value selection choice.

*Returns* `string|array` The selected option key, or an array of selected values if `multiple == true`

## Example

```php
$this->add_control(
  'show_elements',
  [
     'label' => __( 'Show Elements', 'your-plugin' ),
     'type' => Controls_Manager::SELECT2,
     'options' => [
     	'title' => __( 'Title', 'your-plugin' ),
     	'description' => __( 'Description', 'your-plugin' ),
     	'button' => __( 'Button', 'your-plugin' ),
     ],
     'multiple' => true,
  ]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
$show_elements = $this->get_settings( 'show_elements' );

foreach ( $show_elements as $element ) {
    echo '<div>' . $this->get_settings( $element ) . '</div>';
}
```

**JS:** *(Under `_content_template()` method)*
```html
<# _.each( settings.show_elements, function( element ) { #>
    <div>{{{ settings.element }}}</div>
<# } ); #>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::TEXT`     | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`options`      | yes        | *`array`*    |                              | A `key => value` array of all available options 
`multiple`     | no         | *`bool`*     | `false`                      | Allow users to select multiple options by setting to `true`
`label_block`  | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator