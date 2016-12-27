#Introduction to Elementor

**What is Elementor built with?**

* Server side: [PHP](http://php.net/) OOP, compatible with PHP 5.4 and above
* Client side: [jQuery](https://jquery.com/), [Backbone](http://backbonejs.org/) & [Marionette](http://marionettejs.com/)
* Style: [SCSS](http://sass-lang.com/)

##Table Of Contents

* [Definition](#definition)
  - [Element](#element)
  - [Areas](#areas)
  - [Controls](#controls)
* [Extensibility](#extensibility)
  - [Elements Panel](#elements-panel)
  - [Editor Panel](#editor-panel)
  - [Preview](#preview)
  - [Frontend](#frontend)
  - [Template Library](#template-library)
  - [Icons](#icons)
  - [Menus](#menus)

##Definition

###Element

Elementor, the main component is the 'Element'.

A standard Element structure is consisted of the following settings and functions:

* ID
* Name
* Icon
* Category
* List of setting controls (Text / Select / Color Picker etc.)
* Preview render function - Written as a Backbone JavaScript template
* Frontend HTML render function - Written in PHP

###Editor

The editor contains a some areas to manage the design page. Please refer to [this article](content/the-editor.md) to learn more.

###Controls

Elementor contains a wide array of element settings controls. Please refer to [this article](content/controls/README.md) to learn more.

###Template Library

The Template Library lets you save areas for reuse, as well as use predesigned Elementor templates. The Library is not extendable.

###Icons

You can use the [Elementor Icons](https://github.com/pojome/elementor-icons), as well as [Font Awesome](http://fontawesome.io/).

###Menus

You can add admin menu under the Elementor menu. As long as it involves simple definitions - use the Elementor settings page.