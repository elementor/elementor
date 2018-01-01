# Introduction to Elementor

Elementor is an [Open Source](https://opensource.org/) free frontend page builder for WordPress that features a simple and intuitive drag and drop interface.

**What is Elementor built with?**

* Server side: [PHP](http://php.net/) OOP, compatible with PHP 5.4 and above
* Client side: [jQuery](https://jquery.com/), [Backbone](http://backbonejs.org/) & [Marionette](http://marionettejs.com/)
* Style: [SCSS](http://sass-lang.com/)

## Table Of Contents

* [Definitions](#definitions)
  - [Element](#element)
  - [The Editor](#the-editor)
  - [Controls](#controls)
* [Hooks](#hooks)
* [Additional components](#additional-components)
  - [Template Library](#template-library)
  - [Document Settings](#document-settings)
  - [Icons](#icons)
  - [Menus](#menus)
* [Elementor Pro](#additional-components)

## Definitions

### Element

In Elementor, the main component is the 'Element'. An element is an visual entity that gets rendered on the page and can be controlled by the user in the editor.<br>
There are three types of elements in Elementor: Section, Column, and Widget.<br>
A standard Element structure consists of the following settings and functions:

* ID
* Name
* Icon (in case of a widget)
* Category (in case of a widget)
* List of setting controls (Text / Select / Color Picker etc.)
* Preview render function - Written as a Backbone JavaScript template
* Frontend HTML render function - Written in PHP

### The Editor

The editor is the editing environment in which the user creates and edits elements on the page. To learn more about the editor you can read [this article](content/the-editor.md).

### Controls

Controls are different types of input fields and UI elements that are used to construct the UI of elements.<br>
For more information about controls, Please refer to [this article](content/controls/README.md).<br>
Elementor includes a wide array of controls:

##### Default settings

* [Text](content/controls/_text.md) - Simple text field
* [Number](content/controls/_number.md) - Simple number field
* [Textarea](content/controls/_textarea.md) - Textarea field
* [URL](content/controls/_url.md) - Text field to add link + button to open the link in an external tab (target=_blank)
* [Media](content/controls/_media.md) (Image) - Choose an image from the WordPress media library
* [Gallery](content/controls/_gallery.md) - Create a gallery of images from the WordPress media library
* [WYSIWYG](content/controls/_wysiwyg.md) - The WordPress text editor (TinyMCE)
* [Code](content/controls/_code.md) Editor - Ace Code editor - This includes syntax highlighting for HTML/CSS/JavaScript and other programming languages.

##### Settings controls

* [Select](content/controls/_select.md) - A classic select input
* [Switcher](content/controls/_switcher.md) - A Switcher control (on/off) - basically a fancy UI representation of a checkbox.
* [Choose](content/controls/_choose.md) - A component that represents radio buttons as a stylized group of buttons with icons
* [Select2](content/controls/_select2.md) - A select field based on the select2 plugin.
* [Slider](content/controls/_slider.md) - A draggable scale to choose between a range of numeric values
* [Date-Time](content/controls/_date.md) picker - A field that opens up a calendar + hours
* [Repeater](content/controls/_repeater.md) - Repeater controls allow you to build repeatable blocks of fields. You can create for example a set of fields that will contain a checkbox and a textfield. The user will then be able to add “rows”, and each row will contain a checkbox and a textfield. (coming soon)

##### Design Controls

* [Color](content/controls/_color.md) - A Color-Picker control with an alpha slider. Includes a customizable color palette that can be preset by the user
* [Dimensions](content/controls/_dimensions.md) - A component with 4 number fields, suitable for setting top/right/bottom/left settings
* [Font](content/controls/_font.md) - Choose a font from the Google font library.
* [Icon](content/controls/_icon.md) - Choose icon within the font-awesome library.
* [Box Shadow](content/controls/_box-shadow.md) - Add a shadow effect to your element.
* [Text Shadow](content/controls/_text-shadow.md) - Add a shadow effect to a text inside your element.
* [Entrance Animation](content/controls/_animation.md) - Choose an entrance animation type from a list of animations.
* [Hover Animation](content/controls/_hover-animation.md) - Choose a hover animation type from a list of animations. (coming soon)

##### Panel UI Controls

* [Heading](content/controls/_heading.md) - Display the a heading in the panel
* [Raw HTML](content/controls/_raw-html.md) - Display HTML content in the panel
* [Separator](content/controls/controls-and-the-editor.md#separator) - (Not really a control) Display a separator between fields

## Hooks

Elementor has many hooks that allow to change the default behavior and even extend it with new functionality. 
- [PHP Hooks](content/hooks/php-hooks.md) - Based on the WordPress Hooks API
- [JS Hooks](content/hooks/js-hooks.md) - Using an API similar to WordPress Hooks

## Additional components

### Template Library

The Template Library lets you save pages, sections and widgets for reuse, as well as use pre-designed Elementor templates.

### Document Settings

Document Settings lets the user control some basic and useful settings in the page from within Elementor.

For more information about extending the Document Settings features, please follow [this article](content/controls/page-settings.md).


### Icons

You can use the [Elementor Icons](https://github.com/pojome/elementor-icons), as well as [Font Awesome](http://fontawesome.io/).

### Menus

You can add admin menu under the Elementor menu. As long as it involves simple settings - use the Elementor settings page.

## Elementor Pro

[Elementor Pro](https://elementor.com/pro/) adds new features to the Elementor Page Builder plugin. Control your conversions, your user engagement, your entire website, from one page builder.

* [Forms](content/pro/forms.md) - Submission, Validation, Webhooks, Filters & Actions
