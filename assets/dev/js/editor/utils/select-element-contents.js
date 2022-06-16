/**
 * @see https://stackoverflow.com/a/6150060
 * @param element
 */
export const selectElementContents = ( element ) => {
	const range = document.createRange();
	range.selectNodeContents( element );

	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange( range );
};
