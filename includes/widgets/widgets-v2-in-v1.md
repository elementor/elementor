# Widgets V2 in V1

## Widgets
Hierarchy: `Widget` extends `Widget_Base` extends `Element_Base` extends `Controls_Stack` and so on...

Instead of trying to explain the actual hierarchy, I will try explain which methods our system actually uses for rendering and 
saving the widgets.

Let's start with how we register the widgets in the system:
First of all we will have to create a class for our new widget which will implement the `Base_Widget` interface.
The widget class have to implement some methods to define its configuration: `get_name`, `render` and so on...

```php
class Widget extends Widget_Base {
	public function get_name() {
		return $this->widget_name;
	}

	public function render( $instance, $content = null ) {
		// Render the widget
	}
}
```

All of our widgets are registered in the 'Widgets' class, this class contains a static method called 'register_widgets' which
holds all the widgets names, and savings instances of all widgets in an array.

example:
```php
$widget_names = [
	'widget_name_1',
	'widget_name_2',
];

foreach ( $widget_names as $widget_name ) {
	$widget = new Widget( $widget_name );
	$this->register_widget( $widget );
}
```

### Widget V2 configuration
- Name: 
	In V1 we have a method called `get_name` which returns the widget name.
- Default Props:
	In V1 we have a method called `get_default_args` inside the `Element_Base` class which returns the default props for the widget.
- Template:
	In V1 we have a method called `render` which renders the widget.
- Controls:
	In V1 we have a method called `register_controls` which registers the controls for the widget.

The `Widgets` class will retrieve the configuration for the widget using the `get_config` method which is defined in the `Controls_Stack` class.


### Saving the widget
When saving a document we iterate over all the widgets in the document and call the `get_data_for_save` method which is defined in the `Element_Base` class. 


TODO: Try Figure out why heading-v2 cannot be saved - looks like the elements are being saved in the wrong format:
the format for heading in v1 is:
array(5) {
	["id"]=>
	string(7) "943604e"
	["elType"]=>
	string(6) "widget"
	["settings"]=>
	array(2) {
	["content_width"]=>
	string(4) "full"
	["title"]=>
	string(26) "Add Your Heading Text Here"
	}
	["elements"]=>
	array(0) {
	}
	["widgetType"]=>
	string(7) "heading"
}

