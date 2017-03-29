# Number

A simple number field with the option to limit the `min` and `max` values and define the `step` of changing the value.

*Returns:* `string`

## Example

```php
$this->add_control(
  'price',
  [
     'label'   => __( 'Price', 'your-plugin' ),
     'type'    => Controls_Manager::NUMBER,
     'default' => 10,
     'min'     => 5,
     'max'     => 100,
     'step'    => 5,
  ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$settings = $this->get_settings(); 

echo '<span class="price">' . $settings['price'] . '</span>';
```

**JS** *(Under `_content_template()` method)*
```html
<span class="price">{{{ settings.price }}}</span>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::NUMBER`   | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`min`          | no         | *`int`*      |                              | The minimum number (Only affects the spinners, the user can still type a lower value)
`max`          | no         | *`int`*      |                              | The maximum number (Only affects the spinners, the user can still type a higher value)
`step`         | no         | *`int`*      |                              | The intervals value that will be incremented or decremented when using the controls' spinners
`label_block`  | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator