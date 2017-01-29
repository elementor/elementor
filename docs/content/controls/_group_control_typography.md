#Group_Control_Typography
 A Group of Controls to apply Font Styles

*Returns* `string`

##Namespace

```
use Elementor\Group_Control_Typography;
use Elementor\Scheme_Typography;
```

##Example

```php
$this->add_group_control(
    Group_Control_Typography::get_type(),
    [
        'name' => 'my_element',
        'label' => __( 'Typography', 'elementor-modal-button' ),
        'selector' => '{{WRAPPER}} .my_element',
    ]
);
```

##Usage

**PHP:** *(Under `render()` method)*
```php
echo '<h2 class="my_element"> This is a Title </h2>'
```

**JS:** *(Under `_content_template()` method)*
```html
<h2 class="my_element">This is a Title</h2>
```

##Arguments

Argument       | Required   | Type         | Default                      | Description
------------   | :--------: | :------:     | :--------------------------: | ---------------------------------------------
`name`         | yes        | *`string`*   |                              | The unique name of control
`label`        | yes        | *`string`*   |                              | The label of the control - displayed next to it
`selector`     | yes        | *`string`*   |                              | The css class name of element that will receive the typography settings.
