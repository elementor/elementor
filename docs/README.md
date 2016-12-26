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

####Element

In Elementor, the main component is the 'Element'.

A standard Element structure is consisted of the following settings and functions:

* id
* Name
* Icon
* Category
* List of settings controls (Text / checkboxes / radio buttons etc.)
* Preview render function - Written as a Backbone JavaScript template
* Frontend HTML render function - Written in PHP

####Areas

Each element consists of functions and definitions for four main areas:

* **Elements Panel - Elements display area**

    ![](content/images/elements-panel.jpg "Elements Panel")

    This area contains elements which the user can drag & drop onto the page.
    
* **Editor Panel - Element editor panel**

    ![](content/images/editor-panel.jpg "Editor Panel")

    This area allows to edit the properties and settings of each element.

* **Preview**

    ![](content/images/preview.png "Preview")

    This area displays a live preview of the element, rendered by a JavaScript engine, typically without loading from the server side.

* **Frontend - visitor display**

    ![](content/images/frontend.jpg "Frontend")

    The final result displayed to the visitors on the frontend, is comprised of PHP rendered markup and a page-specific CSS file generated on the server side.

####Controls

Elementor contains a wide array of element settings controls. Please refer to [this article](content/controls/README.md) to learn more.

##Extensibility

#####Elements Panel
Elements panel extension options:

* Add new elements.
* Add new categories of elements.

#####Editor Panel
Editor panel extension options:

* Add / change / remove attributes of existing elements.

#####Preview
Preview extension options:

* Add / change / remove HTML while rendering the JavaScript
* Add action controls to every element.

#####Frontend
Frontend extension options:

* Add / change / remove HTML while rendering the PHP


###Additional Components

#####Template Library

The Template Library lets you save areas for reuse, as well as use predesigned Elementor templates. The Library is not extendable.

#####Icons

You can use the [Elementor Icons](https://github.com/pojome/elementor-icons), as well as [Font Awesome](http://fontawesome.io/).

#####Menus

You can add admin menu under the Elementor menu. As long as it involves simple definitions - use the Elementor settings page.