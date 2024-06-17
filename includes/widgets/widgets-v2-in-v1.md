# Widgets V2 in V1

## V1 Request Flow for Widgets
- `plugin.php` - in its constructor it assigns a new instance of the `Widgets` class to the `$widgets_manager` property,
it also assigns a new instance of the `Editor` class to the `$editor` property and a new instance of the `Frontend` class to the `$frontend` property.

- `widgets.php` - in its constructor it requires the `widget-base.php` file and registers the widgets ajax actions, such as
  rendering and getting widgets config.

- `frontend.php` - in its constructor it adds a filter to `the_content` which will represent the content of the post/page.

- `editor.php` - in its constructor it adds an admin action `admin_action_elementor` which will render the editor in this

### Editor Flow
1. When the editor is being rendered, the `admin_action_elementor` action is triggered and the `init` method of the `Editor` class is called.
2. The `init` adds an action to `wp_head` that eventually calls the `get_initial_config` method of the `Document` class.
3. The `get_elements_raw_data` method of the `Document` which calls the `get_elements_data` method of the `Document` class.
4. The `get_elements_data` method parses the document `_elementor_data` meta field and returns the element data.
5. The `Element_Base` class `get_raw_data` method is called which returns the raw data of the element, this method is called for our root element.
6. The `get_raw_data` iterates over the element data and calls the `get_raw_data` method of the element instance for each child.
   The `get_raw_data` is also implemented in the `Widget_Base` class,
   which calls the `Element_Base` class `get_raw_data` method and manipulates the data to fit the widget data format,
   that includes setting the `widgetType` to the widget name,
   and setting the `htmlCache` to the widget content using the `render_content` method of the widget instance.
7. The result of each child `get_raw_data` method is added to the `elements` property of the element data.
8. Thw result of the `get_elements_raw_data` method inside the `Document` class `get_initial_config` method is set   
9. to the `elements` property of the document data.

## Saving Flow
1. When saving a document the `ajax_save` method of the `Document` class is called.
2. The `ajax_save` method calls the `save` method of the `Document` class.
3. The `save` method calls the `save_elements` method of the `Document` class with the `elements` request data.
4. The `save_elements` method calls the `get_elements_raw_data` method of the `Document` class, which is explained below, 
   the difference is that the `get_elements_raw_data` method is called without the `with_html_content` argument.
5. Then the `save_elements` method updates the `_elementor_data` meta field with the result of the `get_elements_raw_data` method.

## Frontend Flow
1. When the content of the post/page is being rendered, the `the_content` filter is triggered and the `apply_builder_in_content` method of the `Frontend` class is called.
2. The  `apply_builder_in_content` method calls the `get_builder_content`.
3. The `get_builder_content` method calls the `get_elements_data` method of the `Document` class.
4. The `get_elements_data` method calls parse the document `_elementor_data` meta field and returns the elements data.
5. Then the `get_builder_content` method calls the `print_elements_with_wrapper` method of the `Document` class with the elements data.
6. The `print_elements_with_wrapper` method calls the `print_elements` method of the `Document` class with the elements data and wraps
the output in a container (get_container_attributes).
7. The `print_elements` method checks if there is a cached and handles the output of the elements data, if the cache experiment
is not enabled it simply calls the `do_print_elements` method.
8. The `do_print_elements` method gets the runtime elements iteration actions, 
and if there are any it iterates over the elements
creates a new instance for each element and calls all the actions for each element.
9. Then the `do_print_elements` method iterates over the elements and creates an element instance for each element using 
the `create_element_instance` method of the `Elements_Manager` class with the element data.
10. The `create_element_instance` gets the widget type if the element data `elType` is set to `widget` it using the 
`get_widget_type` method of the `Widgets` class.
    - The `get_widget_type` method calls the `init` method of the `Widgets` class
	  which assigns a new instance of each widget inside the`$build_widgets_filename` property to the `_widget_types` property,
      the constructor of each widget is called without any arguments (this instance of the widget is used as a configuration for the widget).
    - Eventually the `get_widget_type` method returns the widget type from the `_widget_types` property.
else the `create_element_instance` method calls the `get_element_type` method of the `Elements_Manager` class which creates a new instance for 
each element type and returns the element type from tge `_element_types` property of the `Elements_Manager` class (basically the same as the widgets).

    - Widget/Element initialization:
      - As described above, the `init` method of the `Widgets` class is called which assigns a new instance of each widget to the `_widget_types` property.
      - The constructor of each widget is called without any arguments (this instance of the widget is used as a configuration for the widget).
      - The `Widget_Base` class constructor calls the `Element_Base` class constructor which calls the `Controls_Stack` class constructor, the 
        `Controls_Stack`, `Element_Base` and `Widget_Base` does nothing because we are not passing any arguments to the constructor.
11. The `create_element_instance` method calling the `get_default_args` method of the element instance which returns the default props for the element,
and using the `get_class_name` method of the element instance to get the class name of the element.
12. The `create_element_instance` then creates an instance of the element using the class name and the element data and eventually returns the element instance.
13. The `do_print_elements` method then calls the `print` method of the returned element instance.
14. The `print` method of the element instance calls the `get_type` of the element instance which returns the type of the element.
15. The `print` method then calls the `print_content` method of the element instance which uses the `get_children` method of the element instance to get the children of the element, and
calls the `print_elment` method of the element instance for each child.
      
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


## Implementing a new widget

## Option 1: Creating a new class `Widget_V2_Base` which extends `Widget_Base`
We could create a new class called `Widget_V2_Base`
which extends `Widget_Base` and implements only the methods that are needed for its render:
- `get_name`
- `get_icon`
- `render`

As our main focus is to prevent the v1 controls from being used in the v2 widgets, 
we could add an abstract method called 
`register_v2_controls` that will return the v2 controls for the widget, 
then we could use this method in the `get_config` method
to retrieve the controls for the widget on the client side.

In v1 inside the `render` method we call the `get_settings_for_display` which gets all the data from the controls
and returns it in an array.

Instead,
we could create a new method that will retrieve the data directly from the widget data and return it in an array,
that way
we can avoid using the v2 controls.

```php
abstract class Widget_V2_Base extends Widget_Base {
	abstract public function register_v2_controls();
	
	public function get_data(){
		// Get the widget data
	};
}

class Widget_V2 extends Widget_V2_Base {
	public function get_name() {
		return 'Widget V2';
	}

	public function get_icon() {
		return 'icon';
	}

	public function render() {
		$this->get_data();
		
		echo '<div class="widget">$this->data['text']</div>';
	}

	public function register_v2_controls() {
		// Register the v2 controls
	}
}
```

## Option 2: Creating
