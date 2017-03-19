# Font
A font select box control. The list is based on [Google Fonts](https://fonts.google.com/) project.<br>
*Note: This control is usually not used as a stand-alone control, but as a part of the "Typography" control group.*

*Returns*: `string` - The selected font-family name.

## Example

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

## Usage
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

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::ICON`     | The type of the control
`default`          | no         | *`string`*   |                              | The default value - CSS classes for a default icon.
`fonts`            | no         | *`array`*    | A list of **Google Fonts**   | An associative array of fonts. `[ 'Font Name' => 'family-name', ... ]`
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator