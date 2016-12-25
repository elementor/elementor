#Media (Image)
A control that allows the user to select an image from the WordPress media library. 

*Returns:* `array( ‘id’ => (string), ‘url’ => (string) )`

##Example

```php
$this->add_control(
  'image',
  [
     'label' => __( 'Choose Image', 'elementor' ),
     'type' => Controls_Manager::MEDIA,
     'default' => [
        'url' => Utils::get_placeholder_image_src(),
     ],
  ]
);
```

##Usage

**PHP** *(Under `render()` method)*
```php
$image = $this->get_settings( ‘image’ );

echo ‘<img src=”’ . $image[url] . ‘“>’;

// Get image by id
echo wp_get_attachment_image( $image['id'], 'thumbnail' );
```

**JS** *(Under `_content_template()` method)*
```html
<img src="{{ settings.image.url }}">
```

##Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
**`label`**        | yes        | *`string`*   |                              | The label of the control - displayed next to it
**`type`**         | yes        | *`string`*   | `Controls_Manager::MEDIA`    | The type of the control
**`default`**      | no         | *`array`*    |                              | You may set the `url` property of the default array to: `Utils::get_placeholder_image_src()` to show Elementor’s placeholder image.
**`show_external`**| no         | *`bool`*     |                              | Shows a toggle button that allows user to set it to open the link in a new tab
