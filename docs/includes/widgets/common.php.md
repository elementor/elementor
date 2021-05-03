# Widget_Common - `common.php`

## Technical Description:

This class is responsible for registering the controls under the `Advanced` tab of each widget in Elementor.


## Features:

### Mask:
We've added a mask option to any type of widget in Elementor, using the CSS `mask` property.

#### Knowledge Base:
- [Mask Option on Elementor.com](https://elementor.com/help/mask-option/)
  

- [Mask property reference on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask)


- [CSS-Tricks: Clipping and Masking in CSS](https://css-tricks.com/clipping-masking-css/)
  

- [CSS-Tricks: mask-image](https://css-tricks.com/almanac/properties/m/mask-image/)
  

- [web.dev: Apply effects to images with CSS's mask-image property](https://web.dev/css-masking/)
  

- [CSS & SVG Masks](https://lab.iamvdo.me/css-svg-masks/)

#### Functions Reference:

- `get_shapes( $add_custom )` - Returns a translated user-friendly list of the available masking shapes.

  Passing `true` as a parameter will also append a 'Custom' option to the list in order to use with a `SELECT` control type.


- `get_mask_selectors( $rules )` - Gets a string of CSS rules to apply, and returns an array of selectors with those rules.

	This function has been created in order to deal with masking for image widget. For most of the widgets we mask the wrapper itself, 
  
	but in the case of an image widget, we wanted to mask the `img` tag directly. So instead of writing a lot of selectors every time, 
  
	we created a function that builds both of those selectors for us.
