# Text-Path.js

## Product Knowledge Base:

- [Text Path on Elementor.com](https://elementor.com/help/text-path-widget/)


- [\<textPath\> element reference on MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)


- [Text Along a Path on the Web Using SVG textPath](https://alligator.io/svg/textpath/)


- [Placing Text on a Circle with SVG](http://thenewcode.com/482/Placing-Text-on-a-Circle-with-SVG)


- [CSS-Tricks: Curved Text Along a Path](https://css-tricks.com/snippets/svg/curved-text-along-path/)

## Technical Description:

The widget handler for the Text Path widget which handles the Text Path initialization & rendering.


## Functions Reference:

- `setOffset( offset )` - Gets a text offset ( relative to the starting point ) as a string or int, and set it as percents to the 

	`startOffset` attribute of the `<textPath>` element.


- `onElementChange( setting )` - Handles changes to the widget's settings in the panel, and renders a live preview of those changes

  ( e.g. Start Point, Text, Direction, etc. )


- `attachIdToPath()` - Attaches a unique ID to the `path` element in the SVG, based on the container's ID. This function selects 
  
	the first `path` with a `data-path-anchor` attribute, or defaults to the first `path` element.
  

- `initTextPath()` - Initializes & builds the SVG markup of the widget using the settings from the panel.


- `setText( newText )` - Sets the text on the path, including the link ( if set ) and its properties.


- `isRTL()` - Determine if the text direction of the widget should be RTL or not, based on the site direction and the widget's settings.


- `shouldReverseText()` - We've had a lot of issues with RTL in this widget. Most of the browsers lose it when it comes to RTL text

	in SVG, and only Firefox worked properly ( Go Team Firefox! 😎🎉 ). As a result, we had to overcome this issue using a 
  
	hacky way - We reversed the text in any browser which is not Firefox.


- `reverseToRTL()` - Based on the previous function, we created this function to actually reverse the text after determining it using

	the `shouldReverseText()` function. That's not a perfect solution, but we had no other option at the time.

## Attention Needed / Known Issues:

- As stated above, there are RTL issues with this widget, so note that when changing the code. In the future, other browsers might

	add better support for RTL like Firefox does, so make sure to check that. 


---
See also: [Text-Path.php](../../../../widgets/text-path.md)
