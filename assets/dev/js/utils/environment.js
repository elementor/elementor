const userAgent = navigator.userAgent;

export default {
	webkit: -1 !== userAgent.indexOf( 'AppleWebKit' ),
	firefox: -1 !== userAgent.indexOf( 'Firefox' ),
	ie: /Trident|MSIE/.test( userAgent ),
	mac: -1 !== userAgent.indexOf( 'Macintosh' ),
};
