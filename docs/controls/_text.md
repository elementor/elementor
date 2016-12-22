#Text
*A Simple text field*

*Returns* ```string```

**Example**

```php
$this->add_control(
  'widget_title',
  [
     'label'       => __( 'Title', 'your-plugin' ),
     'type'        => Controls_Manager::TEXT,
     'default'     => __( 'Default title text', 'your-plugin' ),
     'placeholder' => __( 'Type your title text here', 'your-plugin' ),
  ]
);
```

**Arguments**

Argument     | Required   | Type       | Default                      | Options   | Description
------------ | :--------: | :------:   | :--------------------------: | :-------: | ---------------------------------------------
**label**    | yes        | *string*   |                              |           | The label of the control - displayed next to it
**type**     | yes        | *string*   | ```Controls_Manager::TEXT``` |           | The type of the control
**default**  | no         | *string*   |                              |           | The default value of the control
