#Heading
A UI only control. Show a text heading between controls.

##Example
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

##Usage
The `heading` gets automatically outputted in the panel.

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`type`         | yes        | *`string`*   | `Controls_Manager::HEADING`  | The type of the control
`label`        | yes        | *`string`*   |                              | The heading text