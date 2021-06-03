# Eye Dropper Component

## Product Knowledge Base:

- [Color-Thief.js Demo](https://lokeshdhakar.com/projects/color-thief/)


- [Color-Thief.js Repository](https://github.com/lokesh/color-thief)


- [Elementor Commands API](https://github.com/elementor/elementor/blob/master/docs/core/common/assets/js/api/core/commands.md)

## Technical Description:

This is the JS component which is responsible for registering the following commands:

- `$e.run( 'elements-color-picker/start' )` - Start the color picking process.
  

- `$e.run( 'elements-color-picker/show-swatches' )` - Show a palette of color swatches on click.


- `$e.run( 'elements-color-picker/enter-preview' )` - Show the user a UI preview of the currently hovered color.
  

- `$e.run( 'elements-color-picker/exit-preview' )` - Exit the preview mode.
  

- `$e.run( 'elements-color-picker/apply' )` - Apply & Save the selected color on click.
  

- `$e.run( 'elements-color-picker/end' )` - End the color picking process and return to the normal editor state.


## Attention Needed / Known Issues:

- We wanted to avoid any jQuery in this feature, so we created 2 `Util` functions (`addNamespaceHandler` & `removeNamespaceHandler`) 
  
	that will help us to utilize jQuery's [Namespaced Events](https://css-tricks.com/namespaced-events-jquery/) with Vanilla JS. 

	If you're planning on using those functions, NOTE THAT IT MIGHT CAUSE MEMORY LEAKS if the element is removed without 

	removing its `nsEvents` property.

---
See also: [module.php](../../../module.md)
