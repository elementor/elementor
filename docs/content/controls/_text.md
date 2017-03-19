# Text
A Simple text field

*Returns* `string`

## Example

```php
$this->add_control(
  'widget_title',
  [
     'label'       => __( 'Title', 'your-plugin' ),
     'type'        => Controls_Manager::TEXT,
     'default'     => __( 'Default title text', 'your-plugin' ),
     'placeholder' => __( 'Type your title text here', 'your-plugin' ),
  ]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
echo '<h2>' . $this->get_settings( 'widget_title' ) . '</h2>';
```

**JS:** *(Under `_content_template()` method)*
```html
<h2>{{{ settings.text }}}</h2>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::TEXT`     | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`label_block`  | no         | *`bool`*     | `false`                       | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator