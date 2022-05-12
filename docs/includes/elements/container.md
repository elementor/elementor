# Container Element

Elementor's new replacement for Sections & Columns.

Container uses Flex (in the future also Grid) and gives you the option to drag & drop Anything. Anywhere. Even nested!

## Product Knowledge Base:

- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)


- [Basic concepts of flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)


- [Flexbox Froggy - A game for learning CSS flexbox](https://flexboxfroggy.com/)


- [Flex Cheatsheet](https://yoksel.github.io/flex-cheatsheet/)



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
