const hasUA = ( UAstr ) => {
		return userAgent.indexOf( UAstr ) >= 0;
	},

	userAgent = navigator.userAgent,

	// Solution influenced by https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

	// Opera 8.0+
	isOpera = ( !! window.opr && !! opr.addons ) || !! window.opera || hasUA( ' OPR/' ),

	// Firefox 1.0+
	isFirefox = typeof InstallTrigger !== 'undefined' && hasUA( 'Firefox' ),

	// Safari 3.0+ "[object HTMLElementConstructor]"
	isSafari = /^((?!chrome|android).)*safari/i.test( userAgent ) || /constructor/i.test( window.HTMLElement ) ||
		( ( p ) => {
			return '[object SafariRemoteNotification]' === p.toString();
		} )( ! window.safari || ( typeof safari !== 'undefined' && safari.pushNotification ) ),

	// Internet Explorer 6-11
	isIE = /Trident|MSIE/.test( userAgent ) && ( /*@cc_on!@*/false || !! document.documentMode ),

	// Edge 20+
	isEdge = ( ! isIE && !! window.StyleMedia ) || hasUA( 'Edg' ),

	// Chrome 1+
	isChrome = !! window.chrome && hasUA( 'Chrome' ),

	// Blink engine
	isBlink = hasUA( 'Chrome' ) && !! window.CSS,

	// Apple Webkit engine
	isAppleWebkit = hasUA( 'AppleWebKit' ) && ! isBlink,

	environment = {
		appleWebkit: isAppleWebkit,
		blink: isBlink,
		chrome: isChrome,
		edge: isEdge,
		firefox: isFirefox,
		ie: isIE,
		mac: hasUA( 'Macintosh' ),
		opera: isOpera,
		safari: isSafari,
		webkit: hasUA( 'AppleWebKit' ),
	};

export default environment;
