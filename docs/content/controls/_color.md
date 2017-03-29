# Color
A Color-Picker control with an alpha slider. Includes a customizable color palette that can be preset by the user.
Accepts a`scheme` argument that allows you to set a value from the active color scheme as the default value returned by the control.
 
*Returns:* `string`

## Example

```php
$this->add_control(
    'title_color',
    [
        'label' => __( 'Title Color', 'your-plugin' ),
        'type' => Controls_Manager::COLOR,
        'scheme' => [
            'type' => Scheme_Color::get_type(),
            'value' => Scheme_Color::COLOR_1,
        ],
        'selectors' => [
            '{{WRAPPER}} .title' => 'color: {{VALUE}}',
        ],
    ]
);
```

## Usage
Most times you won't have to manually retrieve the value of color controls since the selectors argument can cover most use-cases.

**PHP** *(Under `render()` method)*
```php
$title_color = $this->get_settings( 'title_color' );

echo '<h2 style="color:' . $title_color . '"> ... </h2>'
```

**JS** *(Under `_content_template()` method)*
```html
<h2 style="color:{{ settings.title_color }}"> ... </h2>
```

## Arguments

Argument           | Required   | Type         | Default                      | Description
------------       | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`label`            | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`             | yes        | *`string`*   | `Controls_Manager::COLOR`    | The type of the control
`default`          | no         | *`array`*    |                              | The default value can be set as a HEX, rgb or rgba color value
`scheme`           | no         | *`array`*    |                              | Set a value from the active color scheme as the default value returned by the control.
`description`      | no         | *`string`*   |                              | A description text to display below the control
`separator`        | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator