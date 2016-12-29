#Raw-HTML

Display HTML content in the panel. You can add custom `classes` to the control wrapper.

*Returns:* `string`

##Example

```php
$this->add_control(
  'html_msg',
  [
     'type'    => Controls_Manager::RAW_HTML,
     'raw' => __( 'A very important message to show on the panel.', 'your-plugin' ),
	 'classes' => 'your-class',
  ]
);
```

##Usage

The raw HTML gets automatically outputted in the panel.

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`type`         | yes        | *`string`*   | `Controls_Manager::TEXTAREA` | The type of the control
`raw`          | no         | *`string`*   |                              | The default value of the control
`classes`      | no         | *`string`*   |                              | CSS classes to add to the wrapper div of the control
