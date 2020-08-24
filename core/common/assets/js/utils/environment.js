const userAgent = navigator.userAgent;

export default {
	webkit: -1 !== userAgent.indexOf( 'AppleWebKit' ),
	firefox: -1 !== userAgent.indexOf( 'Firefox' ),
	ie: /Trident|MSIE/.test( userAgent ),
	edge: -1 !== userAgent.indexOf( 'Edge' ),
	mac: -1 !== userAgent.indexOf( 'Macintosh' ),
	safari: /^((?!chrome|android).)*safari/i.test( userAgent ),
};
