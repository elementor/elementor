# Icon
A select box of font icons based on the [Font Awesome](http://fontawesome.io/) project. Accepts `include` or `exclude` arguments for showing only a partial list of icons.

*Returns*: `string` - CSS classes of the selected icon.

## Example

```php
$this->add_control(
    'icon',
    [
        'label' => __( 'Social Icon', 'your-plugin' ),
        'type' => Controls_Manager::ICON,
        'include' => [
            'fa fa-facebook',
            'fa fa-flickr',
            'fa fa-google-plus',
            'fa fa-instagram',
            'fa fa-linkedin',
            'fa fa-pinterest',
            'fa fa-reddit',
            'fa fa-twitch',
            'fa fa-twitter',
            'fa fa-vimeo',
            'fa fa-youtube',
        ],
    ]
);
```

## Usage

**PHP:** *(Under `render()` method)*
```php
$icon = get_settings( 'icon' )
echo '<i class="' . esc_attr( $icon ) . '"></i>';
```

**JS:** *(Under `_content_template()` method)*
```html
<i class="{{ settings.icon }}"></i>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::ICON`     | The type of the control
`default`          | no         | *`string`*   |                              | The default value - CSS classes for a default icon.
`icons`            | no         | *`array`*    | an `array` of **Font Awesome** icons               | An associative array of font-icon classes. `[ 'class-name' => 'nicename', ... ]`
`include`          | no         | *`array`*    |                              | An array of classes of icons to show (Will only show specified icons)
`exclude`          | no         | *`array`*    |                              | An array of classes of icons to exclude from the options list
`label_block`      | no         | *`bool`*     | `false`                      | Display the label above the control by setting to true
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator