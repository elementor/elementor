# Container Element

Elementor's new replacement for Sections & Columns.

Container uses Flex (in the future also Grid) and gives you the option to drag & drop Anything. Anywhere. Even nested!

## Product Knowledge Base:

- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)


- [Basic concepts of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)


- [Flexbox Froggy - A game for learning CSS flexbox](https://flexboxfroggy.com/)


- [Flex Cheatsheet](https://yoksel.github.io/flex-cheatsheet/)


- [Elementor Container Playground](https://playground.elementor.com/demo/flexbox/)


## Attention Needed / Known Issues:

Creating a new core element in a legacy code-base is never easy. Therefore, we had to deal with many weird problems.

The main one is the DnD (Drag & Drop) aspect. DnD-ing into a `flex container` is a real challenge by itself, and when you add the fact that you need to support the old existing DnD mechanism, it becomes a huge headache.

Some things that we needed to take into consideration were:

- What are you gonna do when the `flex-direction` is `row`?
- How jQuery UI Draggable & Sortable are gonna treat dragging into a `flex container`?
- How it will affect the existing placeholder mechanism that knows only about things like `top` / `bottom` / `vertical`?
- How does it affect the UX/UI?
- Will it cause issues due to `flex-basis` / `flex-shrink` / `flex-grow`?
- How do you even resize a `flex item` if there are some calculations like grow/shrink?
- How are you gonna drag a Container next to another Container without triggering a `dragover` event on the existing Container?

The answer to all those question is one - Yes. It caused any problem you can imagine. And even more.
We had to implement a lot of workarounds. From simple UI tweaks, To hooking into jQuery UI Draggable events and overriding some of its behaviors.

Another aspect is the new elements hierarchy. We needed to decide which elements we want to allow inside Containers. The final decision (which actually was fairly easy) is to allow only Widgets & Containers inside a Container, since Sections & Columns are useless there. Plus, we decided to also allow Container inside Column, in order to let users with existing websites to use this new futuristic feature.

### Solved Issues:
- We needed to change the flex icons based on the direction control - Solved by introducing a new JS API called
  [UI State](../../modules/web-cli/assets/js/core/ui-states.md).
- The Container styling is totally based on CSS variables. Since the Containers can be nested, and CSS variables gets
  inherited to the bottom of the current DOM tree, we needed to reset every variable we use for each Container in order
  to avoid style leakage between Containers.
- There is a hacky way of adding a "Content Width" control (like in Section), while avoiding the requirement for an
  additional div. It's being achieved using `padding` and `calc()` and it might have some issues and limitations.
- The background overlay is a pseudo-element and is rendered by passing an empty content from the control. Again, in
  order to reduce the DOM bloatware as much as possible.
- The "drop-zone" placeholder position calculation is pretty complicated and isn't perfect. It uses negative margins
  in order to prevent layout shift when dragging over.
- There are some issues with swiper-based widgets, or generally widgets that their size depends on the initial size of
  the parent and don't have their own explicit size - Solved by adding a class to swiper widgets, and whitelisting
  iframe-based widgets such as Video and Google Maps. 
- Inner-Container editing handles are styled using a hacky CSS way in order to make them similar to Column handles,
  because it uses the same edit controls as a top-level Container, and it can't be determined in the `views/container.js` file.

### TBD Issues:
- Can't show children controls conditionally based on parent direction and/or type (top-level/inner).
- There is a temporary `sortable.js` behavior applied to the Containers, only because there is a bug when sorting
  Containers in the Navigator due to the removal of jQuery UI Sortable.
  Should be removed when the Navigator will be migrated to React.
- The whole DnD is based on an internal library by Elementor:
    - It's the only library that could handle nested Containers for some reason. We've tried others such as
      [SortableJS](https://github.com/SortableJS/Sortable) but with no luck.
    - There is a "magic number" (5) in the `horizontalThreshold` property, not sure why it works. Everything lower didn't work. 🤷‍♂️
    - Sorting is done using a hacky way (using `element:dragged`, which sometimes might interfere with `element:selected`).
    - When sorting, calculating the new element position is pretty complex, it involves checking whether it's being moved 
      in the same Container or from an external one.
    - When starting to drag the Container, we've destroyed the `Droppable` instance in order to avoid dropping issues with
      nested Containers.
- Some of the styles in the `_container.scss` file are leftovers from the POC phase that should be editor-only, and
  should be moved to another file.

## How-Tos:

### Adding a new control:

In the `container.php` file, add a new control as any other widget:

```PHP
// container.php

$this->add_control(
	'overflow',
	[
		'label' => esc_html__( 'Overflow', 'elementor' ),
		'type' => Controls_Manager::SELECT,
		'default' => '',
		'options' => [
			'' => esc_html__( 'Default', 'elementor' ),
			'hidden' => esc_html__( 'Hidden', 'elementor' ),
			'auto' => esc_html__( 'Auto', 'elementor' ),
		],
		'selectors' => [
			'{{WRAPPER}}' => '--overflow: {{VALUE}}',
		],
	]
);
```

Notice that we've set a CSS variable to the `{{WRAPPER}}` - We're gonna use that in the SCSS file:

```SCSS
// _container.scss

// First, reset the CSS var in the top of the file, to its initial value:
--overflow: visible;
// ...
// other vars declarations
// ...

// Then, consume it:
overflow: var( --overflow );
```

This variables reset method is required in order to avoid style leakage as stated above.

#### Guidelines:

- Name the CSS variable after the corresponding CSS property.
- Try to always use `{{WRAPPER}}` as the selector, and consume the variable under the proper selector in the SCSS file
  instead of putting a long selector in the PHP file. 
- If the control should have a default value, reset the variable value to this value. Otherwise, make sure that the
  default value you set for the property is the real default according to [MDN](https://developer.mozilla.org)
  (Sometimes `--var-name: revert;` will be your best bet, but don't overuse it).

### Extending the Container - WIP:

In order to extend the Container element, you'll need to extend it in PHP & JS:

1. PHP - Create a new module with a class that extends the Container.
2. PHP - Set the default child types (`_get_default_child_type()`).
3. PHP - Register it under elements manager using `elementor/elements/elements_registered` hook.
4. PHP - Add its config using `elementor/document/config` filter.
5. JS - Create a Marionette view that extends the Container view.
6. JS - Register the element under `views/base.js::getChildView()`.
7. JS - Update the `elementsHierarchy` object under `/js/editor/utils/helpers.js`.
8. JS - Go over every element view (column/section/container) in order to enable dropping inside other elements (`views/*.js::isDroppingAllowed()`).
9. JS - How do you override the current "add new container" thing (the one that replaces the Section's one)?

#### PHP:

Create a new class under the `/includes/elements` directory that extends `Elementor\Includes\Elements\Container`.

Relevant (or interesting) methods to override might be:
- `_get_default_child_type()`
- `get_type()`
- `get_name()`
- `get_title()`
- `get_icon()`
- `register_controls()`



In order to inform the Editor about this new element, register it under the `Elements_Manager::init_elements()` method (`/includes/managers/elements.php`):

```PHP
private function init_elements() {
	// ...
	// Other code
	// ...

	$this->register_element_type( new Awesome_Element() );

	// ...
	// Other code
	// ...
}
```

#### JS:

Create a new Marionette class under the `/assets/dev/js/editor/elements/views` directory that extends `ContainerView` (`container.js` in the same directory).

Then, just add/remove methods and features. Relevant (or interesting) methods to override might be:

- `classname()`
- `getCurrentUiStates()`
- `getDroppableOptions()`
- `isDroppingAllowed()`
- `onDragStart()`
- `onDragEnd()`

In order to inform the Editor about this new element, add a new `case` under the `getChildView()` method in `/views/base.js`, 
that imports your newly created element:

```JS
switch ( elType ) {
	// ...
	// Other cases
	// ...

	case 'my-awesome-container':
		ChildView = require( 'elementor-elements/views/my-awesome-container' );
		break;
}
```

## Related Hooks:

Currently, the Container element has only a single related hook called "set-direction-mode"
(`/js/editor/document/hooks/ui/settings/set-direction-mode.js`).

This hook handles changes in the "Direction Mode" UI state that's attached to the Container.
Theoretically, this hook should support any element that has "Direction Mode" support in its Marionette view, but
currently it's only implemented in Container.

Each time a setting gets changed (either from the Panel or using an external `document/elements/settings` command), this hook gets fired
and handles the UI state change.

**_Note_**: When the user is viewing the "Advanced" tab in the Panel, the UI state change is fired on the parent
because the Direction Mode is mainly responsible for rotating flex icons, and the controls in the advanced tab should be
rotated relatively to the parent (e.g. "align-self" is a child control, but it's relative to the parent).

___

## See Also:

- [Container Converter](../../modules/container-converter/container-converter.md) - A migration tool for Containers.
