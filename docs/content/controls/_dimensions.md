# Dimensions
A control that allows the user to set the "Box Model" dimensions: top / right / bottom / left - for margin / padding /   

*Returns:* Array
```php
[
	'top' => (int),
	'right' => (int),
	'bottom' => (int),
	'left' => (int),
	'unit' => (string) // The selected CSS Unit. 'px', '%', 'em',
	'isLinked' => (bool),
]
```
		
## Example

```php
$this->add_control(
  'margin',
  [
     'label' => __( 'Margin', 'your-plugin' ),
     'type' => Controls_Manager::DIMENSIONS,
	 'size_units' => [ 'px', '%', 'em' ],
	 'selectors' => [
	 		'{{WRAPPER}} .your-class' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
	 ],
  ]
);
```

## Usage

Because it's a Style Control, it's used with the `selectors` parameter that generates the css automatically.

## Arguments

Argument            | Required   | Type                 | Default                       | Description
------------        | :--------: | :--------------:     | :--------------------------:  | ---------------------------------------------
`label`             | yes        | *`string`*           |                               | The label of the control - displayed next to it
`type`              | yes        | *`string`*           | `Controls_Manager::DIMENSIONS`| The type of the control
`default`           | no         | *`array`*            |                               | The default value can be set as an array like the *return* array.
`allowed_dimensions`| no         | *`array`*/*`string`* | 'all'                         | Which fields to show, 'all' | 'horizontal' | 'vertical' | [ 'top', 'left' ... ]
`size_units`        | no         | *`array`*            | none                          | Array of optional unit type like 'px', '%', 'em'
`selectors`         | yes        | *`array`*            |                               | Array of selectors => style. The following placeholder are available:  {{WRAPPER}} - the unique selector of the element. {{TOP}} / {{RIGHT}} / {{BOTTOM}} / {{LEFT}} - the dimensions values.  {{UNIT}} - the selected unit type. So they can be used for example: '{{WRAPPER}} .your-class' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'. The output can looks like: '.elementor-element-njcsdk .your-class' => 'margin: 5px 10px 3px 10px;'
`description`       | no         | *`string`*           |                               | A description text to display below the control
`separator`         | no         | *`string`*           | `default`                     | Set the position of the control separator. `default` means that the separator will be posited depending on the control type. `before` or `after` will force the separator position before/after the control. `none` will hide the separator