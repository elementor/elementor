#Choose
A field that represents radio buttons as a stylized component with icons accepts `options` as an associative array of arrays (array for each option).
 
*Returns:* `string` - The key of the selected option.

##Example

```php
$this->add_control(
    'align',
    [
        'label' => __( 'Alignment', 'elementor' ),
        'type' => Controls_Manager::CHOOSE,
        'options' => [
            'left'    => [
                'title' => __( 'Left', 'elementor' ),
                'icon' => 'fa fa-align-left',
            ],
            'center' => [
                'title' => __( 'Center', 'elementor' ),
                'icon' => 'fa fa-align-center',
            ],
            'right' => [
                'title' => __( 'Right', 'elementor' ),
                'icon' => 'fa fa-align-right',
            ],
        ],
    ]
);
```

##Usage

**PHP** *(Under `render()` method)*
```php
$align = $this->get_settings( ‘align’ );

echo '<div style="text-align:' . $align . '"></div>'
```

**JS** *(Under `_content_template()` method)*
```html
<div style="text-align:{{ settings.align }}"></div>
```

##Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::CHOOSE`   | The type of the control
`default`          | no         | *`array`*    |                              | The default value can be set as an array of single image arrays
