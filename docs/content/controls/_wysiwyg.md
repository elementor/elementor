# WYSIWYG

The WordPress rich-text editor (TinyMCE)

*Returns:* `string`

## Example

```php
$this->add_control(
  'item_description',
  [
     'label'   => __( 'Description', 'your-plugin' ),
     'type'    => Controls_Manager::WYSIWYG,
     'default' => __( 'Default description', 'your-plugin' ),
  ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$settings = $this->get_settings(); 

echo '<div class="description">' . $settings['item_description'] . '</div>';
```

**JS** *(Under `_content_template()` method)*
```html
<div class="description">{{{ settings.item_description }}}</div>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::WYSIWYG`  | The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`label_block`  | no         | *`bool`*     | `true`                       | Display the label above the control by setting to true
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator