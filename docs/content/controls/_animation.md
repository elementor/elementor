# Animation (Entrance Animation)
A control that lets the user choose an entrance animation type from a list of animations. Based on [Animate.css](https://daneden.github.io/animate.css/).<br>
Note that the usage of this control is by adding the selected animation as a class to the element, along with the class `animated`. Usually, the best way to go about that is using the `prefix_class` argument as demonstrated in the example below. [Read more about `prefix_class`](controls-and-the-editor.md#adding-a-class-to-the-element-template-wrapper).

*Returns* `string`

## Example

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

## Usage
Most times you won't have to manually retrieve the value of animation controls since the prefix_class argument can cover most use-cases.

**PHP:** *(Under `render()` method)*
```php
$animation = $this->get_settings( 'animation' );

echo '<div class="animated ' . $animation . '"> ... </div>';
```

**JS:** *(Under `_content_template()` method)*
```html
<div class="animated  {{ settings.animation }}"> ... </div>
```

## Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | ---------------------------- | ---------------------------------------------
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`type`         | yes        | *`string`*   | `Controls_Manager::ANIMATION`| The type of the control
`default`      | no         | *`string`*   |                              | The default value of the control
`description`  | no         | *`string`*   |                              | A description text to display below the control
`separator`    | no         | *`string`*   | `default`                    | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator
