# Choose
A component that represents radio buttons as a stylized group of buttons with icons. Accepts `options` as an associative array of arrays (array for each option).
 
*Returns:* `string` - The key of the selected option.

## Example

```php
$this->add_control(
    'align',
    [
        'label' => __( 'Alignment', 'your-plugin' ),
        'type' => Controls_Manager::CHOOSE,
        'options' => [
            'left'    => [
                'title' => __( 'Left', 'your-plugin' ),
                'icon' => 'fa fa-align-left',
            ],
            'center' => [
                'title' => __( 'Center', 'your-plugin' ),
                'icon' => 'fa fa-align-center',
            ],
            'right' => [
                'title' => __( 'Right', 'your-plugin' ),
                'icon' => 'fa fa-align-right',
            ],
        ],
    ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$align = $this->get_settings( 'align' );

echo '<div style="text-align:' . $align . '"> ... </div>'
```

**JS** *(Under `_content_template()` method)*
```html
<div style="text-align:{{ settings.align }}"> ... </div>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | ---------------------------  | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::CHOOSE`   | The type of the control
`default`          | no         | *`string`*   |                              | The default value - An option selected by default
`options`          | yes        | *`array`*    |                              | An associative array of arrays: each option is described as an array with `icon` (a font icon class name) and `title` (a string of text that will be shown as a tooltip on hover)
`toggle`           | no         | *`bool`*     | `true`                       | Whether to allow toggle the selected option (unset the selection)
`label_block`      | no         | *`bool`*     | `true`                       | Display the label above the control by setting to true
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator