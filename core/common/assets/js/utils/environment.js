const matchUserAgent = ( UserAgentStr ) => {
		return userAgent.indexOf( UserAgentStr ) >= 0;
	},

	userAgent = navigator.userAgent,

	// Solution influenced by https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

	// Opera 8.0+
	isOpera = ( !! window.opr && !! opr.addons ) || !! window.opera || matchUserAgent( ' OPR/' ),

	// Firefox 1.0+
	isFirefox = matchUserAgent( 'Firefox' ),

	// Safari 3.0+ "[object HTMLElementConstructor]"
	isSafari = /^((?!chrome|android).)*safari/i.test( userAgent ) || /constructor/i.test( window.HTMLElement ) ||
		( ( p ) => {
			return '[object SafariRemoteNotification]' === p.toString();
		} )( ! window.safari || ( typeof safari !== 'undefined' && safari.pushNotification ) ),

	// Internet Explorer 6-11
	isIE = /Trident|MSIE/.test( userAgent ) && ( /* @cc_on!@*/false || !! document.documentMode ),

	// Edge 20+
	isEdge = ( ! isIE && !! window.StyleMedia ) || matchUserAgent( 'Edg' ),

	// Google Chrome (Not accurate)
	isChrome = !! window.chrome && matchUserAgent( 'Chrome' ) && ! ( isEdge || isOpera ),

	// Blink engine
	isBlink = matchUserAgent( 'Chrome' ) && !! window.CSS,

	// Apple Webkit engine
	isAppleWebkit = matchUserAgent( 'AppleWebKit' ) && ! isBlink,

	isTouchDevice = ( 'ontouchstart' in window ) ||
		( navigator.maxTouchPoints > 0 ) ||
		( navigator.msMaxTouchPoints > 0 ),

	environment = {
		isTouchDevice,
		appleWebkit: isAppleWebkit,
		blink: isBlink,
		chrome: isChrome,
		edge: isEdge,
		firefox: isFirefox,
		ie: isIE,
		mac: matchUserAgent( 'Macintosh' ),
		opera: isOpera,
		safari: isSafari,
		webkit: matchUserAgent( 'AppleWebKit' ),
	};

export default environment;
