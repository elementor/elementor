# Raw-HTML

Display HTML content in the panel. You can add custom `content_classes` to the content wrapper.

*Returns:* `string`

## Example

```php
$this->add_control(
  'html_msg',
  [
     'type'    => Controls_Manager::RAW_HTML,
     'raw' => __( 'A very important message to show on the panel.', 'your-plugin' ),
	 'content_classes' => 'your-class',
  ]
);
```

## Usage

The raw HTML gets automatically outputted in the panel.

## Arguments

Argument          | Required   | Type         | Default                      | Description
----------------- | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`type`            | yes        | *`string`*   | `Controls_Manager::RAW_HTML` | The type of the control
`raw`             | no         | *`string`*   |                              | The default value of the control
`content_classes` | no         | *`string`*   |                              | CSS classes to add to the content wrapper
`separator`       | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator