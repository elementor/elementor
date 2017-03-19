# Heading
A UI only control. Show a text heading between controls.

## Example
```php
$this->add_control(
    'more_options',
    [
        'label' => __( 'Additional Options', 'elementor' ),
        'type' => Controls_Manager::HEADING,
        'separator' => 'before',
    ]
);
```

## Usage
The `heading` gets automatically outputted in the panel.

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`type`             | yes        | *`string`*   | `Controls_Manager::HEADING`  | The type of the control
`label`            | yes        | *`string`*   |                              | The heading text
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator