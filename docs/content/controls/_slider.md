# Slider

A draggable Range Slider control typically used to obtain a size setting.
The slider control can optionally have a number of unit types (`size_units`) for the user to choose from.
The control also accepts a `range` argument that allows you to set the `min`, `max` and `step` values per unit type.

*Returns:* Array
```php
[
    'size' => (number),
    'unit' => (string),
]
```

## Example

```php
$this->add_control(
    'width',
    [
        'label' => __( 'Width', 'your-plugin' ),
        'type' => Controls_Manager::SLIDER,
        'default' => [
            'size' => 1,
        ],
        'range' => [
            'px' => [
                'min' => 0,
                'max' => 1000,
                'step' => 5,
            ],
            '%' => [
                'min' => 0,
                'max' => 100,
            ],
        ],
        'size_units' => [ 'px', '%' ],
        'selectors' => [
            '{{WRAPPER}} .box' => 'width: {{SIZE}}{{UNIT}};',
        ],
    ]
);
```

## Usage
Most times you won't have to manually retrieve the value of slider controls since the selectors argument can cover most use-cases. 

**PHP** *(Under `render()` method)*
```php
$width = $this->get_settings( 'width' ); 

echo '<div style="width: ' . $width['size'] . $width['unit'] '"> ... </div>';
```

**JS** *(Under `_content_template()` method)*
```html
<div style="width: {{ settings.width.size }}{{ settings.width.unit }}"> ... </div>';
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::SLIDER`   | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`range`        | no         | *`array`*    |                              | An associative array of arrays - each size unit can have an array with `min`, `max` and `step` settings
`size_units`   | no         | *`array`*    |                              | An array of all available size units
`label_block`  | no         | *`bool`*     | `true`                       | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator