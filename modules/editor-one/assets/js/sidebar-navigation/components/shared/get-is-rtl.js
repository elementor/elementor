export default function getIsRTL() {
	return 'rtl' === document.dir || document.body.classList.contains( 'rtl' );
}
