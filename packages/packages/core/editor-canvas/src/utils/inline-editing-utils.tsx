import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getContainer, getElementType, type V1Element } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';

import { type ElementView } from '../legacy/types';

function getHtmlPropertyName( container: V1Element | null ): string {
	const widgetType = container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' );

	if ( ! widgetType ) {
		return '';
	}

	const propsSchema = getElementType( widgetType )?.propsSchema;

	if ( ! propsSchema ) {
		return '';
	}

	const entry = Object.entries( propsSchema ).find( ( [ , propType ] ) => propType.key === 'html' );
	return entry?.[ 0 ] ?? '';
}

export function injectInlineEditorRenderer(): ( root?: Root | null ) => void {
	const elementView = this as unknown as ElementView;
	const id = elementView?.model?.id;

	if ( ! id ) {
		return elementView.render;
	}

	const htmlSettingKey = getInlineEditablePropertyName( id );

	if ( ! htmlSettingKey ) {
		return elementView.render;
	}

	const renderMethod = elementView.render;

	elementView.render = inlineEditorRenderer;

	return renderMethod;
}

export function inlineEditorRenderer() {
	const elementView = this as unknown as ElementView & { inlineEditingRoot: Root | null };

	if ( ! elementView ) {
		return;
	}

	if ( elementView.inlineEditingRoot ) {
		return;
	}

	const id = elementView?.model?.id;

	const widget = elementView.el.children[ 0 ];

	const attributes = Array.from( widget?.attributes ?? [] ).reduce(
		( carry, _, index ) => {
			const attribute = widget.attributes[ index ];

			return { ...carry, [ convertAttrName( attribute.name ) ]: attribute.value };
		},
		{} as Record< string, string >
	);

	const elementSettings = elementView.model.get( 'settings' );
	const settingKey = getInlineEditablePropertyName( id );
	const value = htmlPropTypeUtil.extract( elementSettings.get( settingKey ) ?? null );
	const setValue = ( newValue: string ) => {
		elementSettings.set( settingKey, htmlPropTypeUtil.create( newValue ) );
	};

	elementView.$el.html( '' );

	elementView.inlineEditingRoot = createRoot( elementView.el );
	elementView?.inlineEditingRoot?.render(
		<InlineEditor value={ value ?? '' } setValue={ setValue } attributes={ attributes } />
	);

}

export function hasInlineEditableProperty( containerId: string ): boolean {
	const container = getContainer( containerId );

	return Boolean( container && getHtmlPropertyName( container ) );
}

export function getInlineEditablePropertyName( containerId: string ): string {
	const container = getContainer( containerId );

	return getHtmlPropertyName( container );
}

const REACT_ATTR_MAP: Record< string, string > = {
	// Specials
	for: 'htmlFor',
	class: 'className',

	// HTML attributes
	accept: 'accept',
	acceptcharset: 'acceptCharset',
	accesskey: 'accessKey',
	action: 'action',
	allowfullscreen: 'allowFullScreen',
	allowtransparency: 'allowTransparency',
	alt: 'alt',
	async: 'async',
	autocomplete: 'autoComplete',
	autofocus: 'autoFocus',
	autoplay: 'autoPlay',
	capture: 'capture',
	cellpadding: 'cellPadding',
	cellspacing: 'cellSpacing',
	challenge: 'challenge',
	charset: 'charSet',
	checked: 'checked',
	cite: 'cite',
	classid: 'classID',
	classname: 'className',
	colspan: 'colSpan',
	cols: 'cols',
	content: 'content',
	contenteditable: 'contentEditable',
	contextmenu: 'contextMenu',
	controls: 'controls',
	coords: 'coords',
	crossorigin: 'crossOrigin',
	data: 'data',
	datetime: 'dateTime',
	default: 'default',
	defer: 'defer',
	dir: 'dir',
	disabled: 'disabled',
	download: 'download',
	draggable: 'draggable',
	enctype: 'encType',
	form: 'form',
	formaction: 'formAction',
	formenctype: 'formEncType',
	formmethod: 'formMethod',
	formnovalidate: 'formNoValidate',
	formtarget: 'formTarget',
	frameborder: 'frameBorder',
	headers: 'headers',
	height: 'height',
	hidden: 'hidden',
	high: 'high',
	href: 'href',
	hreflang: 'hrefLang',
	htmlfor: 'htmlFor',
	httpequiv: 'httpEquiv',
	icon: 'icon',
	id: 'id',
	inputmode: 'inputMode',
	integrity: 'integrity',
	is: 'is',
	keyparams: 'keyParams',
	keytype: 'keyType',
	kind: 'kind',
	label: 'label',
	lang: 'lang',
	list: 'list',
	loop: 'loop',
	low: 'low',
	manifest: 'manifest',
	marginheight: 'marginHeight',
	marginwidth: 'marginWidth',
	max: 'max',
	maxlength: 'maxLength',
	media: 'media',
	mediagroup: 'mediaGroup',
	method: 'method',
	min: 'min',
	minlength: 'minLength',
	multiple: 'multiple',
	muted: 'muted',
	name: 'name',
	novalidate: 'noValidate',
	nonce: 'nonce',
	open: 'open',
	optimum: 'optimum',
	pattern: 'pattern',
	placeholder: 'placeholder',
	poster: 'poster',
	preload: 'preload',
	profile: 'profile',
	radiogroup: 'radioGroup',
	readonly: 'readOnly',
	rel: 'rel',
	required: 'required',
	reversed: 'reversed',
	role: 'role',
	rowspan: 'rowSpan',
	rows: 'rows',
	sandbox: 'sandbox',
	scope: 'scope',
	scoped: 'scoped',
	scrolling: 'scrolling',
	seamless: 'seamless',
	selected: 'selected',
	shape: 'shape',
	size: 'size',
	sizes: 'sizes',
	span: 'span',
	spellcheck: 'spellCheck',
	src: 'src',
	srcdoc: 'srcDoc',
	srclang: 'srcLang',
	srcset: 'srcSet',
	start: 'start',
	step: 'step',
	style: 'style',
	summary: 'summary',
	tabindex: 'tabIndex',
	target: 'target',
	title: 'title',
	type: 'type',
	usemap: 'useMap',
	value: 'value',
	width: 'width',
	wmode: 'wmode',
	wrap: 'wrap',

	// SVG attributes
	accentheight: 'accentHeight',
	accumulate: 'accumulate',
	additive: 'additive',
	alignmentbaseline: 'alignmentBaseline',
	allowreorder: 'allowReorder',
	alphabetic: 'alphabetic',
	amplitude: 'amplitude',
	arabicform: 'arabicForm',
	ascent: 'ascent',
	attributename: 'attributeName',
	attributetype: 'attributeType',
	autoreverse: 'autoReverse',
	azimuth: 'azimuth',
	basefrequency: 'baseFrequency',
	baseprofile: 'baseProfile',
	baselineshift: 'baselineShift',
	bbox: 'bbox',
	begin: 'begin',
	bias: 'bias',
	by: 'by',
	calcmode: 'calcMode',
	capheight: 'capHeight',
	clip: 'clip',
	clippath: 'clipPath',
	clippathunits: 'clipPathUnits',
	cliprule: 'clipRule',
	colorinterpolation: 'colorInterpolation',
	colorinterpolationfilters: 'colorInterpolationFilters',
	colorprofile: 'colorProfile',
	colorrendering: 'colorRendering',
	contentscripttype: 'contentScriptType',
	contentstyletype: 'contentStyleType',
	cursor: 'cursor',
	cx: 'cx',
	cy: 'cy',
	d: 'd',
	decelerate: 'decelerate',
	descent: 'descent',
	diffuseconstant: 'diffuseConstant',
	direction: 'direction',
	display: 'display',
	divisor: 'divisor',
	dominantbaseline: 'dominantBaseline',
	dur: 'dur',
	dx: 'dx',
	dy: 'dy',
	edgemode: 'edgeMode',
	elevation: 'elevation',
	enablebackground: 'enableBackground',
	end: 'end',
	exponent: 'exponent',
	externalresourcesrequired: 'externalResourcesRequired',
	fill: 'fill',
	fillopacity: 'fillOpacity',
	fillrule: 'fillRule',
	filter: 'filter',
	filterres: 'filterRes',
	filterunits: 'filterUnits',
	floodcolor: 'floodColor',
	floodopacity: 'floodOpacity',
	focusable: 'focusable',
	fontfamily: 'fontFamily',
	fontsize: 'fontSize',
	fontsizeadjust: 'fontSizeAdjust',
	fontstretch: 'fontStretch',
	fontstyle: 'fontStyle',
	fontvariant: 'fontVariant',
	fontweight: 'fontWeight',
	format: 'format',
	from: 'from',
	fx: 'fx',
	fy: 'fy',
	g1: 'g1',
	g2: 'g2',
	glyphname: 'glyphName',
	glyphorientationhorizontal: 'glyphOrientationHorizontal',
	glyphorientationvertical: 'glyphOrientationVertical',
	glyphref: 'glyphRef',
	gradienttransform: 'gradientTransform',
	gradientunits: 'gradientUnits',
	hanging: 'hanging',
	horizadvx: 'horizAdvX',
	horizoriginx: 'horizOriginX',
	ideographic: 'ideographic',
	imagerendering: 'imageRendering',
	in: 'in',
	in2: 'in2',
	intercept: 'intercept',
	k: 'k',
	k1: 'k1',
	k2: 'k2',
	k3: 'k3',
	k4: 'k4',
	kernelmatrix: 'kernelMatrix',
	kernelunitlength: 'kernelUnitLength',
	kerning: 'kerning',
	keypoints: 'keyPoints',
	keysplines: 'keySplines',
	keytimes: 'keyTimes',
	lengthadjust: 'lengthAdjust',
	letterspacing: 'letterSpacing',
	lightingcolor: 'lightingColor',
	limitingconeangle: 'limitingConeAngle',
	local: 'local',
	markerend: 'markerEnd',
	markerheight: 'markerHeight',
	markermid: 'markerMid',
	markerstart: 'markerStart',
	markerunits: 'markerUnits',
	markerwidth: 'markerWidth',
	mask: 'mask',
	maskcontentunits: 'maskContentUnits',
	maskunits: 'maskUnits',
	mathematical: 'mathematical',
	mode: 'mode',
	numoctaves: 'numOctaves',
	offset: 'offset',
	opacity: 'opacity',
	operator: 'operator',
	order: 'order',
	orient: 'orient',
	orientation: 'orientation',
	origin: 'origin',
	overflow: 'overflow',
	overlineposition: 'overlinePosition',
	overlinethickness: 'overlineThickness',
	paintorder: 'paintOrder',
	panose1: 'panose1',
	pathlength: 'pathLength',
	patterncontentunits: 'patternContentUnits',
	patterntransform: 'patternTransform',
	patternunits: 'patternUnits',
	pointerevents: 'pointerEvents',
	points: 'points',
	pointsatx: 'pointsAtX',
	pointsaty: 'pointsAtY',
	pointsatz: 'pointsAtZ',
	preservealpha: 'preserveAlpha',
	preserveaspectratio: 'preserveAspectRatio',
	primitiveunits: 'primitiveUnits',
	r: 'r',
	radius: 'radius',
	refx: 'refX',
	refy: 'refY',
	renderingintent: 'renderingIntent',
	repeatcount: 'repeatCount',
	repeatdur: 'repeatDur',
	requiredextensions: 'requiredExtensions',
	requiredfeatures: 'requiredFeatures',
	restart: 'restart',
	result: 'result',
	rotate: 'rotate',
	rx: 'rx',
	ry: 'ry',
	scale: 'scale',
	seed: 'seed',
	shaperendering: 'shapeRendering',
	slope: 'slope',
	spacing: 'spacing',
	specularconstant: 'specularConstant',
	specularexponent: 'specularExponent',
	speed: 'speed',
	spreadmethod: 'spreadMethod',
	startoffset: 'startOffset',
	stddeviation: 'stdDeviation',
	stemh: 'stemh',
	stemv: 'stemv',
	stitchtiles: 'stitchTiles',
	stopcolor: 'stopColor',
	stopopacity: 'stopOpacity',
	strikethroughposition: 'strikethroughPosition',
	strikethroughthickness: 'strikethroughThickness',
	string: 'string',
	stroke: 'stroke',
	strokedasharray: 'strokeDasharray',
	strokedashoffset: 'strokeDashoffset',
	strokelinecap: 'strokeLinecap',
	strokelinejoin: 'strokeLinejoin',
	strokemiterlimit: 'strokeMiterlimit',
	strokeopacity: 'strokeOpacity',
	strokewidth: 'strokeWidth',
	surfacescale: 'surfaceScale',
	systemlanguage: 'systemLanguage',
	tablevalues: 'tableValues',
	targetx: 'targetX',
	targety: 'targetY',
	textanchor: 'textAnchor',
	textdecoration: 'textDecoration',
	textlength: 'textLength',
	textrendering: 'textRendering',
	to: 'to',
	transform: 'transform',
	u1: 'u1',
	u2: 'u2',
	underlineposition: 'underlinePosition',
	underlinethickness: 'underlineThickness',
	unicode: 'unicode',
	unicodebidi: 'unicodeBidi',
	unicoderange: 'unicodeRange',
	unitsperem: 'unitsPerEm',
	valphabetic: 'vAlphabetic',
	vhanging: 'vHanging',
	videographic: 'vIdeographic',
	vmathematical: 'vMathematical',
	values: 'values',
	vectoreffect: 'vectorEffect',
	version: 'version',
	vertadvy: 'vertAdvY',
	vertoriginx: 'vertOriginX',
	vertoriginy: 'vertOriginY',
	viewbox: 'viewBox',
	viewtarget: 'viewTarget',
	visibility: 'visibility',
	widths: 'widths',
	wordspacing: 'wordSpacing',
	writingmode: 'writingMode',
	x: 'x',
	x1: 'x1',
	x2: 'x2',
	xchannelselector: 'xChannelSelector',
	xheight: 'xHeight',
	xlinkactuate: 'xlinkActuate',
	xlinkarcrole: 'xlinkArcrole',
	xlinkhref: 'xlinkHref',
	xlinkrole: 'xlinkRole',
	xlinkshow: 'xlinkShow',
	xlinktitle: 'xlinkTitle',
	xlinktype: 'xlinkType',
	xmlns: 'xmlns',
	xmlnsxlink: 'xmlnsXlink',
	xmlbase: 'xmlBase',
	xmllang: 'xmlLang',
	xmlspace: 'xmlSpace',
	y: 'y',
	y1: 'y1',
	y2: 'y2',
	ychannelselector: 'yChannelSelector',
	z: 'z',
	zoomandpan: 'zoomAndPan',

	// Events
	onabort: 'onAbort',
	onanimationend: 'onAnimationEnd',
	onanimationiteration: 'onAnimationIteration',
	onanimationstart: 'onAnimationStart',
	onblur: 'onBlur',
	oncanplay: 'onCanPlay',
	oncanplaythrough: 'onCanPlayThrough',
	onchange: 'onChange',
	onclick: 'onClick',
	oncompositionend: 'onCompositionEnd',
	oncompositionstart: 'onCompositionStart',
	oncompositionupdate: 'onCompositionUpdate',
	oncontextmenu: 'onContextMenu',
	oncopy: 'onCopy',
	oncut: 'onCut',
	ondoubleclick: 'onDoubleClick',
	ondrag: 'onDrag',
	ondragend: 'onDragEnd',
	ondragenter: 'onDragEnter',
	ondragexit: 'onDragExit',
	ondragleave: 'onDragLeave',
	ondragover: 'onDragOver',
	ondragstart: 'onDragStart',
	ondrop: 'onDrop',
	ondurationchange: 'onDurationChange',
	onemptied: 'onEmptied',
	onencrypted: 'onEncrypted',
	onended: 'onEnded',
	onerror: 'onError',
	onfocus: 'onFocus',
	oninput: 'onInput',
	onkeydown: 'onKeyDown',
	onkeypress: 'onKeyPress',
	onkeyup: 'onKeyUp',
	onload: 'onLoad',
	onloadeddata: 'onLoadedData',
	onloadedmetadata: 'onLoadedMetadata',
	onloadstart: 'onLoadStart',
	onmousedown: 'onMouseDown',
	onmouseenter: 'onMouseEnter',
	onmouseleave: 'onMouseLeave',
	onmousemove: 'onMouseMove',
	onmouseout: 'onMouseOut',
	onmouseover: 'onMouseOver',
	onmouseup: 'onMouseUp',
	onpaste: 'onPaste',
	onpause: 'onPause',
	onplay: 'onPlay',
	onplaying: 'onPlaying',
	onprogress: 'onProgress',
	onratechange: 'onRateChange',
	onscroll: 'onScroll',
	onseeked: 'onSeeked',
	onseeking: 'onSeeking',
	onselect: 'onSelect',
	onstalled: 'onStalled',
	onsubmit: 'onSubmit',
	onsuspend: 'onSuspend',
	ontimeupdate: 'onTimeUpdate',
	ontouchcancel: 'onTouchCancel',
	ontouchend: 'onTouchEnd',
	ontouchmove: 'onTouchMove',
	ontouchstart: 'onTouchStart',
	ontransitionend: 'onTransitionEnd',
	onvolumechange: 'onVolumeChange',
	onwaiting: 'onWaiting',
	onwheel: 'onWheel',
};

const extraCharRegex = /[-:]/g;

const convertAttrName = function ( attr: string ) {
	if ( /^(data-|aria-)/.test( attr ) ) {
		return attr;
	}
	const key = attr.replace( extraCharRegex, '' ).toLowerCase() as string;
	return REACT_ATTR_MAP[ key ] || attr;
};
