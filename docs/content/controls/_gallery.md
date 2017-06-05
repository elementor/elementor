# Gallery
A control that allows the user to choose set of images from the WordPress media library. 

*Returns:* An array of single image arrays:
```php
array(
    array( 'id' => (string), 'url' => (string) ),
    array( 'id' => (string), 'url' => (string) ),
    ...
)
```

## Example

```php
$this->add_control(
  'gallery',
  [
     'label' => __( 'Add Images', 'your-plugin' ),
     'type' => Controls_Manager::GALLERY,
  ]
);
```

## Usage

**PHP** *(Under `render()` method)*
```php
$images = $this->get_settings( 'gallery' );

foreach ( $images as $image ) {
    echo '<img src="' . $image[url] . '">';
}
```

**JS** *(Under `_content_template()` method)*
```html
<# _.each( settings.gallery, function( image ) { #>
    <img src="{{ image.url }}">
<# }); #>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::GALLERY`    | The type of the control
`default`          | no         | *`array`*    |                              | The default value can be set as an array of single image arrays
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator