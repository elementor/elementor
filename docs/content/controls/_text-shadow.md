# Text Shadow

The text shadow control allows you to add a shadow effect to a text inside your element. You can control a few properties of the shadow:

*`horizontal`*: The shadow horizontal offset.
*`vertical`*: The shadow vertical offset.
*`blur`*: The shadow blur radius.
*`color`*: The shadow color.

*Returns:* Array
```php
[
    'horizontal' => (number),
    'vertical' => (number),
    'blur' => (number),
    'color' => (string),
]
```

## Example

```php
$this->add_control(
    'text_shadow',
    [
        'label' => __( 'Text Shadow', 'your-plugin' ),
        'type' => Controls_Manager::text_SHADOW,
        'default' => [
            'color' => 'rgba(0,0,0,.5)',
        ],
        'selectors' => [
            '{{WRAPPER}}' => 'text-shadow: {{HORIZONTAL}}px {{VERTICAL}}px {{BLUR}}px {{COLOR}};',
        ],
    ]
);
```

## Usage

You won't have to manually retrieve the value of box shadow controls since it's controlled by the `selectors` argument that you are provided when you add the control.

## Arguments

Argument           | Required   | Type         | Default                         | Description
------------       | :--------: | :------:     | :--------------------------:    | ---------------------------------------------
`label`            | yes        | *`string`*   |                                 | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::TEXT_SHADOW` | The type of the control
`default`          | no         | *`array`*    |                                 | The default value of the control
`separator`        | no         | *`string`*   | `default`                       | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator