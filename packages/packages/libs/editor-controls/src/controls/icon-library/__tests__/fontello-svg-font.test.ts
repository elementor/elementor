import { parseFontelloSvgFont } from '../fontello-svg-font';

const FONTELLO_SVG = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
<font id="fontello" horiz-adv-x="1000">
<font-face font-family="fontello" units-per-em="1000"/>
<glyph glyph-name="emo-surprised" unicode="&#xe800;" d="M0 0H100V100H0Z" horiz-adv-x="696"/>
</font>
</defs>
</svg>`;

const CONFIG = JSON.stringify( {
	glyphs: [ { css: 'emo-surprised', code: 59392 } ],
} );

describe( 'parseFontelloSvgFont', () => {
	it( 'builds inline svg from a Fontello svg font with a doctype', () => {
		// Act.
		const map = parseFontelloSvgFont( CONFIG, FONTELLO_SVG, 'icon-', '', [ 'emo-surprised' ] );

		// Assert.
		expect( map[ 'icon icon-emo-surprised' ] ).toContain( 'M0 0H100V100H0Z' );
		expect( map[ 'icon icon-emo-surprised' ] ).toContain( 'scale(1,-1)' );
		expect( map[ 'icon icon-emo-surprised' ] ).toContain( 'viewBox="0 0 696 1000"' );
	} );
} );
