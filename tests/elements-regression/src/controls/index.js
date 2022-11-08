const { Choose } = require( './choose' );
const { Color } = require( './color' );
const { Select } = require( './select' );
const { Slider } = require( './slider' );
const { Text } = require( './text' );
const { Textarea } = require( './textarea' );
const { Switcher } = require( './switcher' );

module.exports = {
	choose: Choose,
	color: Color,
	select: Select,
	slider: Slider,
	switcher: Switcher,
	text: Text,
	textarea: Textarea,
};
