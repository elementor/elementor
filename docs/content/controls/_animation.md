#Animation (Entrance Animation)
A control that lets the user choose an entrance animation type from a list of animations. Based on [Animate.css](https://daneden.github.io/animate.css/).<br>
Note that the usage of this control is by adding the selected animation as a class to the element, along with the class `animated` the best way to go about that is using the `prefix_class` argument as demonstrated in the example below. [Read more about `prefix_class`](controls-and-the-editor.md#adding-a-class-to-the-element-template-wrapper)

*Returns* `string`

##Example

```php
$this->add_control(
    'animation',
    [
        'label' => __( 'Entrance Animation', 'your-plugin' ),
        'type' => Controls_Manager::ANIMATION,
        'prefix_class' => 'animated ',
    ]
);
```

##Usage

**PHP:** *(Under `render()` method)*
```php
$settings = $this->get_settings();

echo ‘<div style="border-style: ' . $settings[‘border_style’] . ‘"> ... </div>’;
```

**JS:** *(Under `_content_template()` method)*
```html
<div style="border-style: {{ settings.text }}"> ... </div>
```

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::ANIMATION`| The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
