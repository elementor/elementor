#Controls and the Editor

###Table of Content
* [The Editor](#the-editor)
  - [The editor panel layout](#the-editor-panel-layout)
    * [Tabs](#tabs)
    * [Sections](#sections)
* [Adding a control to an element](#adding-a-control-to-an-element)
  - [Basic example](#basic-example)
  - [Using tabs and sections](#using-tabs-and-sections)
  - [Design attributes for a control](#design-attributes-for-a-control)
    * [`label_block`](#label_block)
    * [`show_label`](#show_label)
    * [`separator`](#separator)
  - [Multiple control](#multiple-control)

###The Editor
The Elementor editor panel is where you set all the settings for every element, including  sections, columns and widgets settings. Each element setting is represented in the editor panel by a control ([What's a control?](README.md#what-is-a-control))

####The editor panel layout

#####Tabs
The controls of the element settings are usually organized under three tabs:
* **Content** - Designated for settings that involve the content of the element. For example: Text fields and images.
* **Style** - Designated for settings that involve the style of the element. For example: Choosing colors and fonts.
* **Advanced** - Designated for settings that involve the style of all elements. For example: Margin, padding, backgrounds, responsive, as well as advanced element settings, if available.

Most elements include these 3 tabs, but some have different tabs, or are missing some of the tabs.

#####Sections
In addition to the controls being separated into the three tabs mentioned before, each set of controls is arranged under a titled section. Pressing on the section's title will show or hide the set of controls under the section.

###Adding a control to an element
All element controls should be added under the designated method `_register_controls`. Adding a control is done through the `add_control` method.

####Basic example
Let's look at the following example:

```php
class Widget_Fake extends Widget_Base {

  protected function _register_controls() { // Every control has to be registered under this method

     $this->add_control(
        'title', // An unique id for this control. Used for every access to the control value.
        [
           'label' => __( 'Title', 'elementor' ), // The label will be displayed in the panel inside the control
           'type' => Controls_Manager::TEXT, // The type of the control
           'placeholder' => __( 'Enter your title', 'elementor' ), // A placeholder will be displayed inside the control input
        ]
     );

  }
}
```

And here is the result:

![](../images/text-control.jpg)

Now, we'll add a default value for a control:

```php
$this->add_control(
  'title',
  [
     'label' => __( 'Title', 'elementor' ),
     'type' => Controls_Manager::TEXT,
     'placeholder' => __( 'Enter your title', 'elementor' ),
     'default' => __( 'This is a title', 'elementor' ),
  ]
);
```

![](../images/text-control-with-default.jpg)

As you can see, the control received the default value that we have added, and this value is displayed in the input field, instead of the placeholder.

####Using tabs and sections
As mentioned earlier, all panel controls should be arranged under tabs and sections. Before adding a control, we must make sure that it has a set section.

Adding a new section is done as following:

```php
$this->start_controls_section(
  'my_section', // A unique id for the section
  [
     'label' => __( 'My Section', 'elementor' ), // The label of the section
     'tab' => Controls_Manager::TAB_CONTENT, // The tab where the section is included in
  ]
);
```

After opening the section, we can now go on to adding more controls that will appear under the same section:

```php
$this->add_control( ... );

$this->add_control( ... );

$this->add_control( ... );
```

After adding all the controls that should appear under the section, we need to close the section:

```php
$this->end_controls_section();
```

Here is an example to further illustrate how it works:

```php
class Widget_Fake extends Widget_Base {

  protected function _register_controls() {
     $this->start_controls_section(
        'my_section',
        [
           'label' => __( 'My Section', 'elementor' ),
           'tab' => Controls_Manager::TAB_CONTENT,
        ]
     );

     $this->add_control(
        'title',
        [
           'label' => __( 'Title', 'elementor' ),
           'type' => Controls_Manager::TEXT,
           'placeholder' => __( 'Enter your title', 'elementor' ),
           'default' => __( 'This is a title', 'elementor' ),
        ]
     );

     $this->add_control(
        'color',
        [
           'label' => __( 'Color', 'elementor' ),
           'type' => Controls_Manager::COLOR,
           'default' => '#f00',
        ]
     );

     $this->end_controls_section();
  }
}
```

####Design attributes for a control
Each control has several design attributes that determine its style and its integration in the editor panel:

<sub>*Please Note*: The default value for every attribute may change according to the type of control. See [Controls Introduction > Settings hierarchy](README.MD#settings-hierarchy) to learn more.</sub>

#####`label_block`
*Sets whether to display the title in a separate line.*

Options: `true`, `false`

Default: `false`

#####`show_label`
*Sets whether to show the title.*

Options: `true`, `false`

Default: `true`

#####`separator`
*Sets the position of the separator.*

Options: `'default'`, `'before'`, `'after'`, `'none'`

Default: `'default'`

####Multiple control
[As explained](README.md#multiple-control), the returned value from a multiple control is represented by an array. This is why, when we want to set default values for a multiple control, we have to handle it accordingly. Here's an example:

```php
$this->add_control(
  'image',
  [
     'label' => __( 'Image', 'elementor' ),
     'type' => Controls_Manager::MEDIA,
     'default' => [
        'url' => 'https://elementor.com/wp-content/uploads/2016/05/element-bg.png',
     ],
  ]
);
```

As we can see, we've added a default value to the 'url'. This value is saved as a property in an array that holds the returned value of the control.