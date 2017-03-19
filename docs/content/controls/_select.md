# Select
A simple Select box control. Accepts an `array` of `options` in which the `key` is the value and the `value` is the option name. 

*Returns* `string`

## Example

```php
$this->add_control(
  'border_style',
  [
     'label'       => __( 'Border Style', 'your-plugin' ),
     'type' => Controls_Manager::SELECT,
     'default' => 'solid',
     'options' => [
     	'solid'  => __( 'Solid', 'your-plugin' ),
     	'dashed' => __( 'Dashed', 'your-plugin' ),
     	'dotted' => __( 'Dotted', 'your-plugin' ),
     	'double' => __( 'Double', 'your-plugin' ),
     	'none'   => __( 'None', 'your-plugin' ),
     ],
	 'selectors' => [ // You can use the selected value in an auto-generated css rule.
	    '{{WRAPPER}} .your-element' => 'border-style: {{VALUE}}',
	 ],
  ]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
$settings = $this->get_settings();

echo '<div style="border-style: ' . $settings['border_style'] . '"> ... </div>';
```

**JS:** *(Under `_content_template()` method)*
```html
<div style="border-style: {{ settings.text }}"> ... </div>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::TEXT`     | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`options`      | yes        | *`array`*    |                              | A `key => value` array of all available options 
`label_block`  | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator