export default function mapWordPressLocaleToElementorOneLanguage( locale ) {
	if ( ! locale ) {
		return 'en';
	}

	const [ language, region ] = locale.split( '_' );

	if ( ! region ) {
		return language;
	}

	return `${ language }-${ region }`;
}
