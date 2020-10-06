import Variants from 'elementor-styles/variants';

const darkModeClass = '.eps-theme-dark';

export default {
	heading: Variants.Heading.heading,
	'heading.dark': Variants.HeadingDark[ darkModeClass ].heading,
	text: Variants.Text.text,
	button: Variants.Button.text,
}
