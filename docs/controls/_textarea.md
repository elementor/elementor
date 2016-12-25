#Textarea

A simple textarea field with an option to set the number of `rows`.

*Returns:* `string`

##Example

```php
$this->add_control(
  'item_description',
  [
     'label'   => __( 'Description', 'your-plugin' ),
     'type'    => Controls_Manager::TEXTAREA,
     'default' => __( 'Default description', 'your-plugin' ),
  ]
);
```

##Usage

**PHP** *(Under `render()` method)*
```php
$settings = $this->get_settings(); 

echo ‘<p>’ . $settings[‘item_description’] . ‘</p>’;
```

**JS** *(Under `_content_template()` method)*
```html
<p>{{{ settings.item_description }}}</p>
```

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
**`label`**    | yes        | *`string`*   |                              | The label of the control - displayed next to it
**`type`**     | yes        | *`string`*   | `Controls_Manager::TEXTAREA` | The type of the control
**`default`**  | no         | *`string`*   |                              | The default value of the control
**`rows`**     | no         | *`int`*      |                              | Sets the height of the textarea defined by rows of text
