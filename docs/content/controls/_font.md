#Font
A font select box control. The list is based on [Google Fonts](https://fonts.google.com/) project.<br>
*Note: This control is usually not used as a stand-alone control, but as a part of the "Typography" control group.*

*Returns*: `string` - The selected font-family name.

##Example

```php
$this->add_control(
    'font_family',
    [
        'label' => __( 'Font Family', 'your-plugin' ),
        'type' => Controls_Manager::FONT,
        'default' => "'Open Sans', sans-serif",
        'selectors' => [
            '{{WRAPPER}} .title' =>  'font-family: {{VALUE}}',
         ],
    ],
);
```

##Usage
Most times you won't have to manually retrieve the value of `font` controls since the selectors argument can cover most use-cases.

**PHP:** *(Under `render()` method)*
```php
$font_family = get_settings( 'font_family' )
echo '<h2 style="font-family: ' . $font_family . '"> ... </h2>';
```

**JS:** *(Under `_content_template()` method)*
```html
<h2 style="font-family: {{ settings.font_family }}"> ... </h2>
```

##Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::ICON`     | The type of the control
`default`          | no         | *`string`*   |                              | The default value - CSS classes for a default icon.
`icons`            | no         | *`array`*    | an `array` of **Font Awesome** icons               | An associative array of font-icon classes. `[ 'class-name' => 'nicename', ... ]`
`include`          | no         | *`array`*    |                              | An array of classes of icons to show (Will only show specified icons)
`exclude`          | no         | *`array`*    |                              | An array of classes of icons to exclude from the options list
