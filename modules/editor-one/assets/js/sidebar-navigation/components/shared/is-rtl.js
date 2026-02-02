export default function isRTL() {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
}
