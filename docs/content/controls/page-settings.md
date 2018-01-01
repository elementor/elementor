# Document Settings

Elementor's Document Settings feature allows the user to control various page definitions straight from Elementor's editing panel.

The Document Settings controls are similar to element controls. In a similar way, you can extend the Document Settings capabilities, and add new controls and settings that will be managed through the Document Settings panel.

### Table Of Contents

* [Controls Structure](#controls-structure)
* [Adding a new settings](#adding-a-new-settings)
* [Saving the value of a control](#saving-the-value-of-a-control)
* [Getting a saved value of a control](#getting-a-saved-value-of-a-control)
* [Live Preview](#live-preview)

#### Controls Structure

In the Document Settings panel, controls that define the settings of the page appear under two [tabs](controls-and-the-editor.md#tabs):

**Settings**  - For controlling certain page definitions like: page title, page template, post status etc.

**Style** - For controlling style definitions of the page, like background, padding etc.

#### Adding a new settings

Similarly to widgets, you can add more controls to Document Settings for controlling and saving any type of setting. The new controls can be added to the existing tabs, or to any new tab from the available tabs in Elementor.

Let's see an example for adding a control that sets the items color in the page menu:

```php
function add_elementor_page_settings_controls( \Elementor\PageSettings\Page $page ) {
	$page->add_control(
		'menu_item_color',
		[
			'label' => __( 'Menu Item Color', 'elementor' ),
			'type' => \Elementor\Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}} .menu-item a' => 'color: {{VALUE}}',
			],
		]
	);
}

add_action( 'elementor/element/page-settings/section_page_style/before_section_end', 'add_elementor_page_settings_controls' );
```

With this example, we have created a function that adds a control for the instance of the class `Elementor\PageSettings\Page` that represents all the settings that can be controlled with the Document Settings panel.

The returned value from the control affects the page by defining `selectors`. In Document Settings, the `{{WRAPPER}}` placeholder represents a unique class for the `body` element. You can read more about behaviors and functionality of `selectors` [here](controls-and-the-editor.md#adding-the-value-to-the-style-definitions-of-the-element).

After creating the function, we added an action that is called before closing the whole controls section. In the example above we have added the action before closing the section called `section_page_style` that contains all the Document Settings controls that have to do with styling.

**Some notes:**

* Adding the prefix `{{WRAPPER}}` before each selector is important to make sure the style rules do not cause any conflicts in case they are assimilated in other pages (like with the 'Elementor Library' widget).

* Different themes may include changes of menu item selectors, or will require adding selectos that override the default theme directions. This is why the example above should be seen as an example alone and not as exact instructions.

#### Saving the value of a control

The returned item from each control, including custom made controls, is saved automatically in the `post meta` of the page. This `post meta` contains all the settings that are related to Document Settings (Not including some settings that require different treatment). In most cases, you will not need to do any special modifications while saving the control you've created.

#### Getting a saved value of a control

Much like any Elementor element, you can get the saved value of each Document Settings control by accessing the instance of the class `Elementor\PageSettings\Page`. 

The right way to access is shown in the example below:

```php
$post_id = get_the_ID();

// Creating an instance of Document settings for specific post
$page = \Elementor\PageSettings\Manager::get_page( $post_id ); 

$menu_item_color = $page->get_settings( 'menu_item_color' ); // The color we added before

echo $menu_item_color; // Possible output: '#9b0a46'
```

#### Live Preview

Each control contains a setting that determines how it will affect the live page preview right after changing its value. Similarly to widgets, when we set a `selectors` or a `prefix_class` to the control, the system will make sure to update the page automatically.

However, there are some situations where we would want to add custom made functionality that will be performed after each change of the control (for example: refresh of the preview area). We can do this with JavaScript:

We will first create the function that will handle the returning control value:

```javascript
function handleMenuItemColor ( newValue ) {
	console.log( newValue );
	elementor.reloadPreview();
}
```

Next, we will connect the function and the control we created:

```javascript
elementor.settings.page.addChangeCallback( 'menu_item_color', handleMenuItemColor );
```

Now, after every change of the control, the function `handleMenuItemColor` will run when it gets a parameter of the new control value.