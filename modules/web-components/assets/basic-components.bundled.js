/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t,e,i,s;const r=globalThis.trustedTypes,o=r?r.createPolicy("lit-html",{createHTML:t=>t}):void 0,n=`lit$${(Math.random()+"").slice(9)}$`,l="?"+n,a=`<${l}>`,h=document,c=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,p=/>/g,g=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,w=/'/g,x=/"/g,b=/^(?:script|style|textarea)$/i,y=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),m=Symbol.for("lit-noChange"),S=Symbol.for("lit-nothing"),z=new WeakMap,$=h.createTreeWalker(h,129,null,!1);class k{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let h=0,d=0;const u=t.length-1,y=this.parts,[m,S]=((t,e)=>{const i=t.length-1,s=[];let r,l=2===e?"<svg>":"",h=v;for(let e=0;e<i;e++){const i=t[e];let o,c,d=-1,u=0;for(;u<i.length&&(h.lastIndex=u,c=h.exec(i),null!==c);)u=h.lastIndex,h===v?"!--"===c[1]?h=f:void 0!==c[1]?h=p:void 0!==c[2]?(b.test(c[2])&&(r=RegExp("</"+c[2],"g")),h=g):void 0!==c[3]&&(h=g):h===g?">"===c[0]?(h=null!=r?r:v,d=-1):void 0===c[1]?d=-2:(d=h.lastIndex-c[2].length,o=c[1],h=void 0===c[3]?g:'"'===c[3]?x:w):h===x||h===w?h=g:h===f||h===p?h=v:(h=g,r=void 0);const y=h===g&&t[e+1].startsWith("/>")?" ":"";l+=h===v?i+a:d>=0?(s.push(o),i.slice(0,d)+"$lit$"+i.slice(d)+n+y):i+n+(-2===d?(s.push(void 0),e):y)}const c=l+(t[i]||"<?>")+(2===e?"</svg>":"");return[void 0!==o?o.createHTML(c):c,s]})(t,e);if(this.el=k.createElement(m,i),$.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=$.nextNode())&&y.length<u;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(n)){const i=S[d++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(n),e=/([.?@])?(.*)/.exec(i);y.push({type:1,index:h,name:e[2],strings:t,ctor:"."===e[1]?E:"?"===e[1]?A:"@"===e[1]?O:M})}else y.push({type:6,index:h})}for(const e of t)s.removeAttribute(e)}if(b.test(s.tagName)){const t=s.textContent.split(n),e=t.length-1;if(e>0){s.textContent=r?r.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],c()),$.nextNode(),y.push({type:2,index:++h});s.append(t[e],c())}}}else if(8===s.nodeType)if(s.data===l)y.push({type:2,index:h});else{let t=-1;for(;-1!==(t=s.data.indexOf(n,t+1));)y.push({type:7,index:h}),t+=n.length-1}h++}}static createElement(t,e){const i=h.createElement("template");return i.innerHTML=t,i}}function C(t,e,i=t,s){var r,o,n,l;if(e===m)return e;let a=void 0!==s?null===(r=i.Σi)||void 0===r?void 0:r[s]:i.Σo;const h=d(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==h&&(null===(o=null==a?void 0:a.O)||void 0===o||o.call(a,!1),void 0===h?a=void 0:(a=new h(t),a.T(t,i,s)),void 0!==s?(null!==(n=(l=i).Σi)&&void 0!==n?n:l.Σi=[])[s]=a:i.Σo=a),void 0!==a&&(e=C(t,a.S(t,e.values),a,s)),e}class j{constructor(t,e){this.l=[],this.N=void 0,this.D=t,this.M=e}u(t){var e;const{el:{content:i},parts:s}=this.D,r=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:h).importNode(i,!0);$.currentNode=r;let o=$.nextNode(),n=0,l=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new T(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new U(o,this,t)),this.l.push(e),a=s[++l]}n!==(null==a?void 0:a.index)&&(o=$.nextNode(),n++)}return r}v(t){let e=0;for(const i of this.l)void 0!==i&&(void 0!==i.strings?(i.I(t,i,e),e+=i.strings.length-2):i.I(t[e])),e++}}class T{constructor(t,e,i,s){this.type=2,this.N=void 0,this.A=t,this.B=e,this.M=i,this.options=s}setConnected(t){var e;null===(e=this.P)||void 0===e||e.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,e=this){t=C(this,t,e),d(t)?t===S||null==t||""===t?(this.H!==S&&this.R(),this.H=S):t!==this.H&&t!==m&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var e;return u(t)||"function"==typeof(null===(e=t)||void 0===e?void 0:e[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,e=this.B){return this.A.parentNode.insertBefore(t,e)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const e=this.A.nextSibling;null!==e&&3===e.nodeType&&(null===this.B?null===e.nextSibling:e===this.B.previousSibling)?e.data=t:this.$(h.createTextNode(t)),this.H=t}_(t){var e;const{values:i,_$litType$:s}=t,r="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=k.createElement(s.h,this.options)),s);if((null===(e=this.H)||void 0===e?void 0:e.D)===r)this.H.v(i);else{const t=new j(r,this),e=t.u(this.options);t.v(i),this.$(e),this.H=t}}C(t){let e=z.get(t.strings);return void 0===e&&z.set(t.strings,e=new k(t)),e}g(t){u(this.H)||(this.H=[],this.R());const e=this.H;let i,s=0;for(const r of t)s===e.length?e.push(i=new T(this.k(c()),this.k(c()),this,this.options)):i=e[s],i.I(r),s++;s<e.length&&(this.R(i&&i.B.nextSibling,s),e.length=s)}R(t=this.A.nextSibling,e){var i;for(null===(i=this.P)||void 0===i||i.call(this,!1,!0,e);t&&t!==this.B;){const e=t.nextSibling;t.remove(),t=e}}}class M{constructor(t,e,i,s,r){this.type=1,this.H=S,this.N=void 0,this.V=void 0,this.element=t,this.name=e,this.M=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this.H=Array(i.length-1).fill(S),this.strings=i):this.H=S}get tagName(){return this.element.tagName}I(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=C(this,t,e,0),o=!d(t)||t!==this.H&&t!==m,o&&(this.H=t);else{const s=t;let n,l;for(t=r[0],n=0;n<r.length-1;n++)l=C(this,s[i+n],e,n),l===m&&(l=this.H[n]),o||(o=!d(l)||l!==this.H[n]),l===S?t=S:t!==S&&(t+=(null!=l?l:"")+r[n+1]),this.H[n]=l}o&&!s&&this.W(t)}W(t){t===S?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class E extends M{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===S?void 0:t}}class A extends M{constructor(){super(...arguments),this.type=4}W(t){t&&t!==S?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class O extends M{constructor(){super(...arguments),this.type=5}I(t,e=this){var i;if((t=null!==(i=C(this,t,e,0))&&void 0!==i?i:S)===m)return;const s=this.H,r=t===S&&s!==S||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==S&&(s===S||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var e,i;"function"==typeof this.H?this.H.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this.H.handleEvent(t)}}class U{constructor(t,e,i){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=e,this.options=i}I(t){C(this,t)}}null===(e=(t=globalThis).litHtmlPlatformSupport)||void 0===e||e.call(t,k,T),(null!==(i=(s=globalThis).litHtmlVersions)&&void 0!==i?i:s.litHtmlVersions=[]).push("2.0.0-rc.2");
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,N=Symbol();class P{constructor(t,e){if(e!==N)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return R&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const _=t=>new P(t+"",N),I=new Map,W=(t,...e)=>{const i=e.reduce(((e,i,s)=>e+(t=>{if(t instanceof P)return t.cssText;if("number"==typeof t)return t;throw Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(i)+t[s+1]),t[0]);let s=I.get(i);return void 0===s&&I.set(i,s=new P(i,N)),s},B=R?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return _(e)})(t):t
	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */;var q,L,D,H;const J={toAttribute(t,e){switch(e){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},V=(t,e)=>e!==t&&(e==e||t==t),Z={attribute:!0,type:String,converter:J,reflect:!1,hasChanged:V};class K extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var e;null!==(e=this.v)&&void 0!==e||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this.Πp(i,e);void 0!==s&&(this.Πm.set(s,i),t.push(s))})),t}static createProperty(t,e=Z){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const r=this[t];this[e]=s,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||Z}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(B(t))}else void 0!==t&&e.push(B(t));return e}static Πp(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this.ΠU)&&void 0!==e?e:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this.ΠU)||void 0===e||e.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this.Πi.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{R?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style");i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,e,i){this.K(t,i)}Πj(t,e,i=Z){var s,r;const o=this.constructor.Πp(t,i);if(void 0!==o&&!0===i.reflect){const n=(null!==(r=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==r?r:J.toAttribute)(e,i.type);this.Πh=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this.Πh=null}}K(t,e){var i,s,r;const o=this.constructor,n=o.Πm.get(t);if(void 0!==n&&this.Πh!==n){const t=o.getPropertyOptions(n),l=t.converter,a=null!==(r=null!==(s=null===(i=l)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==r?r:J.fromAttribute;this.Πh=n,this[n]=a(e,t.type),this.Πh=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||V)(this[t],e)?(this.L.has(t)||this.L.set(t,e),!0===i.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,e)=>this[e]=t)),this.Πi=void 0);let e=!1;const i=this.L;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this.Π$()}catch(t){throw e=!1,this.Π$(),t}e&&this.E(i)}willUpdate(t){}E(t){var e;null===(e=this.ΠU)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,e)=>this.Πj(e,this[e],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var G,F,Q,X,Y,tt;K.finalized=!0,K.shadowRootOptions={mode:"open"},null===(L=(q=globalThis).reactiveElementPlatformSupport)||void 0===L||L.call(q,{ReactiveElement:K}),(null!==(D=(H=globalThis).reactiveElementVersions)&&void 0!==D?D:H.reactiveElementVersions=[]).push("1.0.0-rc.1"),(null!==(G=(tt=globalThis).litElementVersions)&&void 0!==G?G:tt.litElementVersions=[]).push("3.0.0-rc.1");class et extends K{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();super.update(t),this.Φt=((t,e,i)=>{var s,r;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=o._$litPart$;if(void 0===n){const t=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;o._$litPart$=n=new T(e.insertBefore(c(),t),t,void 0,i)}return n.I(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return m}}et.finalized=!0,et._$litElement$=!0,null===(Q=(F=globalThis).litElementHydrateSupport)||void 0===Q||Q.call(F,{LitElement:et}),null===(Y=(X=globalThis).litElementPlatformSupport)||void 0===Y||Y.call(X,{LitElement:et});class it extends et{static get styles(){return W`
			:host(:first-child) { --ewc-heading-margin-top: 0; }
			::slotted(a) {
				color: inherit !important;
			}
			:is(h1, h2, h3, h4, h5, h6) {
				color: var(--ewc-heading-color, var(--ewc-color-gray-900));
				font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xl));
				font-weight: 700;
				line-height: var(--ewc-heading-line-height, var(--ewc-line-height-heading-xl, 1.2));
				margin: 0;
				margin-top: var(--ewc-heading-margin-top, var(--ewc-heading-margin-top-default, var(--ewc-size-200)));
				margin-bottom: var(--ewc-heading-margin-bottom, var(--ewc-heading-margin-bottom-default, var(--ewc-size-50)));
			}

			h1{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xxl));
				--ewc-heading-margin-top-default: var(--ewc-size-300); }

			h2{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xl))}

			h3{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-l))}

			h4{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-m));
				--ewc-heading-margin-top-default: var(--ewc-size-120);
				--ewc-heading-margin-bottom-default: var(--ewc-size-25); }

			h5{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-s));
				--ewc-heading-margin-top-default: var(--ewc-size-100);
				--ewc-heading-margin-bottom-default: 0; }

			h6{ font-size: var(--ewc-heading-font-size, var(--ewc-size-font-heading-xs));
				--ewc-heading-margin-top-default: var(--ewc-size-100);
				--ewc-heading-margin-bottom-default: 0; }`}static get properties(){return{align:{type:String,reflect:!0},color:{type:String,reflect:!0},font:{type:String,reflect:!0},italic:{type:Boolean,reflect:!0},level:{type:String,reflect:!0},size:{type:String,reflect:!0},transform:{type:String,reflect:!0},weight:{type:String,reflect:!0}}}safeGetPropertyValue(t,e){return t?e[t]?e[t]:[...e.keys()].includes(t)?t:"":""}getColorStyle(){const t=[];t.green="green-500",t.celery="celery-500",t.chartreuse="chartreuse-500",t.seafoam="seafoam-500",t.blue="blue-500",t.purple="purple-500",t.indigo="indigo-500",t.fucsia="fucsia-500",t.magenta="magenta-500",t.red="red-500",t.orange="orange-500",t.yellow="yellow-500",t.primary="primary",t.secondary="secondary",t.cta="cta",t.success="success",t.warning="warning",t.error="error",t.info="info";const e="var(--ewc-color-"+this.safeGetPropertyValue(this.color,t)+")";return W`h1, h2, h3, h4, h5, h6{
			color: var( --ewc-heading-color, ${_(e)}) !important;
		}`}getFlexItemStyle(){const t=[];t.grow="auto",t.shrink="0 auto",t.stiff="none",t.flexible="1";const e=[0,1,2,3,4,5,6],i=[];i.auto="auto",i.start="flex-start",i.end="flex-end",i.center="center",i.baseline="baseline",i.stretch="stretch";const s=this.safeGetPropertyValue(this.flex,t),r=this.safeGetPropertyValue(this.grow,e),o=this.safeGetPropertyValue(this.order,[0,1,2,3,4,5,6,7,8,9]),n=this.safeGetPropertyValue(this.shrink,e),l=this.safeGetPropertyValue(this.alignSelf,i);return W`:host{
			--ewc-flex-flex: ${_(s)};
			--ewc-flex-grow: ${_(r)};
			--ewc-flex-order: ${_(o)};
			--ewc-flex-shrink: ${_(n)};
			--ewc-flex-align-self: ${_(l)};
		}`}constructor(){super(),this.level="2",this.color="gray-900",this.flex=null,this.grow=null,this.shrink=null,this.alignSelf=null,this.order=null}headingTemplate(t){let e=y`<h2>${t}</h2>`;switch(this.level){case"1":e=y`<h1>${t}</h1>`;break;case"2":e=y`<h2>${t}</h2>`;break;case"3":e=y`<h3>${t}</h3>`;break;case"4":e=y`<h4>${t}</h4>`;break;case"5":e=y`<h5>${t}</h5>`;break;case"6":e=y`<h6>${t}</h6>`}return e}render(){const t=y`<slot></slot>`;return y`
			<style>
				${this.getFlexItemStyle()}
				${this.getColorStyle()}
			</style>
			${this.headingTemplate(t)}`}}window.customElements.define("e-heading",it);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const st=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rt=Symbol();class ot{constructor(t,e){if(e!==rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return st&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const nt=new Map,lt=t=>{let e=nt.get(t);return void 0===e&&nt.set(t,e=new ot(t,rt)),e},at=t=>lt("string"==typeof t?t:t+""),ht=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(t instanceof ot)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return lt(i)},ct=st?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return at(e)})(t):t
	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */;var dt,ut,vt,ft;const pt={toAttribute(t,e){switch(e){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},gt=(t,e)=>e!==t&&(e==e||t==t),wt={attribute:!0,type:String,converter:pt,reflect:!1,hasChanged:gt};class xt extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var e;null!==(e=this.v)&&void 0!==e||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this.Πp(i,e);void 0!==s&&(this.Πm.set(s,i),t.push(s))})),t}static createProperty(t,e=wt){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const r=this[t];this[e]=s,this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||wt}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(ct(t))}else void 0!==t&&e.push(ct(t));return e}static Πp(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this.ΠU)&&void 0!==e?e:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this.ΠU)||void 0===e||e.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this.Πi.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{st?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style");i.textContent=e.cssText,t.appendChild(i)}))})(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,e,i){this.K(t,i)}Πj(t,e,i=wt){var s,r;const o=this.constructor.Πp(t,i);if(void 0!==o&&!0===i.reflect){const n=(null!==(r=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==r?r:pt.toAttribute)(e,i.type);this.Πh=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this.Πh=null}}K(t,e){var i,s,r;const o=this.constructor,n=o.Πm.get(t);if(void 0!==n&&this.Πh!==n){const t=o.getPropertyOptions(n),l=t.converter,a=null!==(r=null!==(s=null===(i=l)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==r?r:pt.fromAttribute;this.Πh=n,this[n]=a(e,t.type),this.Πh=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||gt)(this[t],e)?(this.L.has(t)||this.L.set(t,e),!0===i.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,e)=>this[e]=t)),this.Πi=void 0);let e=!1;const i=this.L;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this.Π$()}catch(t){throw e=!1,this.Π$(),t}e&&this.E(i)}willUpdate(t){}E(t){var e;null===(e=this.ΠU)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,e)=>this.Πj(e,this[e],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var bt,yt,mt,St;xt.finalized=!0,xt.elementProperties=new Map,xt.elementStyles=[],xt.shadowRootOptions={mode:"open"},null===(ut=(dt=globalThis).reactiveElementPlatformSupport)||void 0===ut||ut.call(dt,{ReactiveElement:xt}),(null!==(vt=(ft=globalThis).reactiveElementVersions)&&void 0!==vt?vt:ft.reactiveElementVersions=[]).push("1.0.0-rc.2");const zt=globalThis.trustedTypes,$t=zt?zt.createPolicy("lit-html",{createHTML:t=>t}):void 0,kt=`lit$${(Math.random()+"").slice(9)}$`,Ct="?"+kt,jt=`<${Ct}>`,Tt=document,Mt=(t="")=>Tt.createComment(t),Et=t=>null===t||"object"!=typeof t&&"function"!=typeof t,At=Array.isArray,Ot=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ut=/-->/g,Rt=/>/g,Nt=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,Pt=/'/g,_t=/"/g,It=/^(?:script|style|textarea)$/i,Wt=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),Bt=Symbol.for("lit-noChange"),qt=Symbol.for("lit-nothing"),Lt=new WeakMap,Dt=Tt.createTreeWalker(Tt,129,null,!1),Ht=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":"",n=Ot;for(let e=0;e<i;e++){const i=t[e];let l,a,h=-1,c=0;for(;c<i.length&&(n.lastIndex=c,a=n.exec(i),null!==a);)c=n.lastIndex,n===Ot?"!--"===a[1]?n=Ut:void 0!==a[1]?n=Rt:void 0!==a[2]?(It.test(a[2])&&(r=RegExp("</"+a[2],"g")),n=Nt):void 0!==a[3]&&(n=Nt):n===Nt?">"===a[0]?(n=null!=r?r:Ot,h=-1):void 0===a[1]?h=-2:(h=n.lastIndex-a[2].length,l=a[1],n=void 0===a[3]?Nt:'"'===a[3]?_t:Pt):n===_t||n===Pt?n=Nt:n===Ut||n===Rt?n=Ot:(n=Nt,r=void 0);const d=n===Nt&&t[e+1].startsWith("/>")?" ":"";o+=n===Ot?i+jt:h>=0?(s.push(l),i.slice(0,h)+"$lit$"+i.slice(h)+kt+d):i+kt+(-2===h?(s.push(void 0),e):d)}const l=o+(t[i]||"<?>")+(2===e?"</svg>":"");return[void 0!==$t?$t.createHTML(l):l,s]};class Jt{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,l=this.parts,[a,h]=Ht(t,e);if(this.el=Jt.createElement(a,i),Dt.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=Dt.nextNode())&&l.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(kt)){const i=h[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(kt),e=/([.?@])?(.*)/.exec(i);l.push({type:1,index:r,name:e[2],strings:t,ctor:"."===e[1]?Ft:"?"===e[1]?Qt:"@"===e[1]?Xt:Gt})}else l.push({type:6,index:r})}for(const e of t)s.removeAttribute(e)}if(It.test(s.tagName)){const t=s.textContent.split(kt),e=t.length-1;if(e>0){s.textContent=zt?zt.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],Mt()),Dt.nextNode(),l.push({type:2,index:++r});s.append(t[e],Mt())}}}else if(8===s.nodeType)if(s.data===Ct)l.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(kt,t+1));)l.push({type:7,index:r}),t+=kt.length-1}r++}}static createElement(t,e){const i=Tt.createElement("template");return i.innerHTML=t,i}}function Vt(t,e,i=t,s){var r,o,n,l;if(e===Bt)return e;let a=void 0!==s?null===(r=i.Σi)||void 0===r?void 0:r[s]:i.Σo;const h=Et(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==h&&(null===(o=null==a?void 0:a.O)||void 0===o||o.call(a,!1),void 0===h?a=void 0:(a=new h(t),a.T(t,i,s)),void 0!==s?(null!==(n=(l=i).Σi)&&void 0!==n?n:l.Σi=[])[s]=a:i.Σo=a),void 0!==a&&(e=Vt(t,a.S(t,e.values),a,s)),e}class Zt{constructor(t,e){this.l=[],this.N=void 0,this.D=t,this.M=e}u(t){var e;const{el:{content:i},parts:s}=this.D,r=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:Tt).importNode(i,!0);Dt.currentNode=r;let o=Dt.nextNode(),n=0,l=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Kt(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new Yt(o,this,t)),this.l.push(e),a=s[++l]}n!==(null==a?void 0:a.index)&&(o=Dt.nextNode(),n++)}return r}v(t){let e=0;for(const i of this.l)void 0!==i&&(void 0!==i.strings?(i.I(t,i,e),e+=i.strings.length-2):i.I(t[e])),e++}}class Kt{constructor(t,e,i,s){this.type=2,this.N=void 0,this.A=t,this.B=e,this.M=i,this.options=s}setConnected(t){var e;null===(e=this.P)||void 0===e||e.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,e=this){t=Vt(this,t,e),Et(t)?t===qt||null==t||""===t?(this.H!==qt&&this.R(),this.H=qt):t!==this.H&&t!==Bt&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var e;return At(t)||"function"==typeof(null===(e=t)||void 0===e?void 0:e[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,e=this.B){return this.A.parentNode.insertBefore(t,e)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const e=this.A.nextSibling;null!==e&&3===e.nodeType&&(null===this.B?null===e.nextSibling:e===this.B.previousSibling)?e.data=t:this.$(Tt.createTextNode(t)),this.H=t}_(t){var e;const{values:i,_$litType$:s}=t,r="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=Jt.createElement(s.h,this.options)),s);if((null===(e=this.H)||void 0===e?void 0:e.D)===r)this.H.v(i);else{const t=new Zt(r,this),e=t.u(this.options);t.v(i),this.$(e),this.H=t}}C(t){let e=Lt.get(t.strings);return void 0===e&&Lt.set(t.strings,e=new Jt(t)),e}g(t){At(this.H)||(this.H=[],this.R());const e=this.H;let i,s=0;for(const r of t)s===e.length?e.push(i=new Kt(this.k(Mt()),this.k(Mt()),this,this.options)):i=e[s],i.I(r),s++;s<e.length&&(this.R(i&&i.B.nextSibling,s),e.length=s)}R(t=this.A.nextSibling,e){var i;for(null===(i=this.P)||void 0===i||i.call(this,!1,!0,e);t&&t!==this.B;){const e=t.nextSibling;t.remove(),t=e}}}class Gt{constructor(t,e,i,s,r){this.type=1,this.H=qt,this.N=void 0,this.V=void 0,this.element=t,this.name=e,this.M=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this.H=Array(i.length-1).fill(qt),this.strings=i):this.H=qt}get tagName(){return this.element.tagName}I(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=Vt(this,t,e,0),o=!Et(t)||t!==this.H&&t!==Bt,o&&(this.H=t);else{const s=t;let n,l;for(t=r[0],n=0;n<r.length-1;n++)l=Vt(this,s[i+n],e,n),l===Bt&&(l=this.H[n]),o||(o=!Et(l)||l!==this.H[n]),l===qt?t=qt:t!==qt&&(t+=(null!=l?l:"")+r[n+1]),this.H[n]=l}o&&!s&&this.W(t)}W(t){t===qt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Ft extends Gt{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===qt?void 0:t}}class Qt extends Gt{constructor(){super(...arguments),this.type=4}W(t){t&&t!==qt?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class Xt extends Gt{constructor(){super(...arguments),this.type=5}I(t,e=this){var i;if((t=null!==(i=Vt(this,t,e,0))&&void 0!==i?i:qt)===Bt)return;const s=this.H,r=t===qt&&s!==qt||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==qt&&(s===qt||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var e,i;"function"==typeof this.H?this.H.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this.H.handleEvent(t)}}class Yt{constructor(t,e,i){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=e,this.options=i}I(t){Vt(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var te,ee,ie,se,re,oe;null===(yt=(bt=globalThis).litHtmlPlatformSupport)||void 0===yt||yt.call(bt,Jt,Kt),(null!==(mt=(St=globalThis).litHtmlVersions)&&void 0!==mt?mt:St.litHtmlVersions=[]).push("2.0.0-rc.3"),(null!==(te=(oe=globalThis).litElementVersions)&&void 0!==te?te:oe.litElementVersions=[]).push("3.0.0-rc.2");class ne extends xt{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();super.update(t),this.Φt=((t,e,i)=>{var s,r;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=o._$litPart$;if(void 0===n){const t=null!==(r=null==i?void 0:i.renderBefore)&&void 0!==r?r:null;o._$litPart$=n=new Kt(e.insertBefore(Mt(),t),t,void 0,i)}return n.I(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return Bt}}ne.finalized=!0,ne._$litElement$=!0,null===(ie=(ee=globalThis).litElementHydrateSupport)||void 0===ie||ie.call(ee,{LitElement:ne}),null===(re=(se=globalThis).litElementPlatformSupport)||void 0===re||re.call(se,{LitElement:ne});class le extends ne{static get styles(){return ht`
        .btn {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            z-index: 1;
        }

        ::slotted(*) {
            color: inherit !important;
            text-decoration: none !important;
            z-index: 2 !important;
        }

        ::slotted(a):before, .bg-layer {
            content: '';
            display: block;
            position: absolute;
            inset: -2px;
        }

        :host {
            position: relative;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: .5rem;
            padding: 7px 19px;
            font-size: .875rem;
            font-weight: 600;
            line-height: 20px; /* Specifically not inherit our <body> default */
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            border: 2px solid;
            border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
            appearance: none; /* Corrects inability to style clickable input types in iOS. */
        }

        :host([grow]) {
            width: 100%;
            --ewc-flex-grow: 1;
        }

        /* Default button */

        :host {
            border-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
            box-shadow: var(--ewc-btn-shadow, none), var(--ewc-btn-inset-shadow, none);
            transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
            transition-property: color, background-color, border-color;
        }

        :host([size="tiny"])    { padding: 0 8px;     font-size: .6875rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-xs)}
        :host([size="mini"])    { padding: 2px 12px;  font-size: .75rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
        :host([size="small"])   { padding: 4px 14px;  font-size: .8125rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
        :host([size="medium"])  { padding: 8px 18px;  font-size: .9rem;     --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
        :host([size="large"])   { padding: 12px 20px; font-size: 1.1225rem; --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
        :host([size="big"])     { padding: 16px 24px; font-size: 1.25rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
        :host([size="huge"])    { padding: 20px 32px; font-size: 1.5rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
        :host([size="massive"]) { padding: 24px 36px; font-size: 1.75rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-l)}

        :host([color="primary"])   { --ewc-alias-btn-color: var(--ewc-color-primary)}
        :host([color="secondary"]) { --ewc-alias-btn-color: var(--ewc-color-secondary)}
        :host([color="danger"])    { --ewc-alias-btn-color: var(--ewc-color-error)}
        :host([color="success"])   { --ewc-alias-btn-color: var(--ewc-color-success)}
        :host([color="warning"])   { --ewc-alias-btn-color: var(--ewc-color-warning)}
        :host([color="info"])      { --ewc-alias-btn-color: var(--ewc-color-info)}

        :host([color="magenta"])   { --ewc-alias-btn-color: var(--ewc-color-magenta-500)}
        :host([color="fuchsia"])   { --ewc-alias-btn-color: var(--ewc-color-fuchsia-500)}
        :host([color="purple"])    { --ewc-alias-btn-color: var(--ewc-color-purple-500)}
        :host([color="indigo"])    { --ewc-alias-btn-color: var(--ewc-color-indigo-500)}
        :host([color="blue"])      { --ewc-alias-btn-color: var(--ewc-color-blue-500)}
        :host([color="teal"])      { --ewc-alias-btn-color: var(--ewc-color-seafoam-500)}
        :host([color="green"])     { --ewc-alias-btn-color: var(--ewc-color-green-500)}
        :host([color="celery"])    { --ewc-alias-btn-color: var(--ewc-color-celery-500)}
        :host([color="lime"])      { --ewc-alias-btn-color: var(--ewc-color-chartreuse-500)}
        :host([color="yellow"])    { --ewc-alias-btn-color: var(--ewc-color-yellow-500)}
        :host([color="orange"])    { --ewc-alias-btn-color: var(--ewc-color-orange-500)}
        :host([color="red"])       { --ewc-alias-btn-color: var(--ewc-color-red-500)}

        :host(:not([color])), :host([color="default"]) { color: var(--ewc-color-gray-800)}

        :host(:not(:is([outline],[quiet]))) {
            color: var(--ewc-btn-text-color);
            --ewc-btn-text-color: #fff;
            background-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
        }

        :host(:is([outline],[quiet])) {
            color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-800)));
            border-color: currentColor;
        }

        :host(:is([outline],[quiet])) .bg-layer {
            background-color: currentColor;
            opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
        }

        :host([pill]) {
            --ewc-alias-btn-radius: var(--ewc-size-radius-round-600, 6rem);
        }

        :host([quiet]) {
            border-color: transparent;
            --ewc-btn-color-brightness: .95;
        }

        :host(:not([color])), :host([color="default"]) {
            color: var(--ewc-color-gray-800);
        }

        .bg-layer {
            transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
            border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
        }

        :host(:not(:is([outline],[quiet]))) .bg-layer {
            background-color: black;
            mix-blend-mode: multiply;
            opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
        }

        :host(:hover),
        :host(.hover) {
            --ewc-btn-color-brightness: .9;
            transition-duration: 0.1s;
        }

        :host(:active), :host(:active) .bg-layer {
            --ewc-btn-color-brightness: .8;
            transition: none;
        }

        :host(.selected),
        :host([aria-selected=true]) {
            --ewc-btn-color-brightness: .8;
            box-shadow: var(--color-shadow-inset);
        }

        :host(:disabled),
        :host(.disabled),
        :host([aria-disabled=true]) {
            color: var(--color-text-disabled);
            background-color: var(--color-btn-bg);
            border-color: var(--color-btn-border);
        }

        /* Keep :focus after :disabled. Allows to see the focus ring even on disabled buttons */
        :host(:focus),
        :host(.focus) {
            border-color: var(--color-btn-focus-border);
            outline: none;
            box-shadow: var(--color-btn-focus-shadow);
        }

        :host(:hover) { text-decoration: none; }

        :host(:disabled),
        :host(.disabled),
        :host([aria-disabled=true]) {
            cursor: default;
        }

        :host(:disabled) .e-icon,
        :host(.disabled) .e-icon,
        :host([aria-disabled=true]) .e-icon{
            color: var(--color-icon-tertiary);
        }

        i {
            font-style: normal;
            font-weight: 600;
            opacity: 0.75;
        }

        ::slotted(e-icon) {
            --ewc-alias-icon-padding: 0;
        }

        .e-icon:only-child {
            margin-right: 0;
        }

        .Counter {
            margin-left: 2px;
            color: inherit;
            text-shadow: none;
            vertical-align: top;
            background-color: var(--color-btn-counter-bg);
        }

        .dropdown-caret {
            margin-left: .25rem;
            opacity: 0.8;
        }`}render(){return Wt`
            <div class="bg-layer"></div>
            <div class="btn">
                <slot name="icon"></slot>
                <slot name="title"></slot>
                <slot></slot>
            </div>`}}window.customElements.define("e-button",le);class ae extends ne{static get styles(){return ht`
          .box { border-radius: var(--ewc-box-radius, var(--ewc-box-radius-alias)) }
          :host([elevation="subtle"]) .box { box-shadow: rgba(0, 0, 0, 0.08)  0px 1px 2px 0px; }
          :host([elevation="paper"])  .box { box-shadow: rgba(0, 0, 0, 0.1)   0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px; }
          :host([elevation="card"])   .box { box-shadow: rgba(0, 0, 0, 0.1)   0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px; }
          :host([elevation="panel"])  .box { box-shadow: rgba(0, 0, 0, 0.1)   0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px; }
          :host([elevation="float"])  .box { box-shadow: rgba(0, 0, 0, 0.1)   0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px; }
          :host([elevation="air"])    .box { box-shadow: rgba(0, 0, 0, 0.25)  0px 25px 50px -12px; }
        `}static get properties(){return{alignSelf:{type:String,reflect:!0},background:{type:String,reflect:!0},radius:{type:String,reflect:!0},borderColor:{type:String,reflect:!0},borderWidth:{type:String,reflect:!0},display:{type:String,reflect:!0},elevation:{type:String,reflect:!0},flex:{type:String,reflect:!0},grow:{type:String,reflect:!0},height:{type:String,reflect:!0},order:{type:String,reflect:!0},maxWidth:{type:String,reflect:!0},ring:{type:String,reflect:!0},shrink:{type:String,reflect:!0},width:{type:String,reflect:!0},margin:{type:String,reflect:!0},marginTop:{type:String,reflect:!0},marginBottom:{type:String,reflect:!0},marginStart:{type:String,reflect:!0},marginEnd:{type:String,reflect:!0},padding:{type:String,reflect:!0},paddingTop:{type:String,reflect:!0},paddingBottom:{type:String,reflect:!0},paddingStart:{type:String,reflect:!0},paddingEnd:{type:String,reflect:!0},elevation:{type:String,reflect:!0}}}safeGetPropertyValue(t,e){return t&&e[t]?e[t]:t&&[...e.keys()].includes(t)?t:""}getSafeStyle(){const t=[];t.grow="auto",t.shrink="0 auto",t.stiff="none",t.flexible="1";const e=[0,1,2,3,4,5,6],i=[];i.auto="auto",i.start="flex-start",i.end="flex-end",i.center="center",i.baseline="baseline",i.stretch="stretch";const s=this.safeGetPropertyValue(this.flex,t),r=this.safeGetPropertyValue(this.grow,e),o=this.safeGetPropertyValue(this.order,[0,1,2,3,4,5,6,7,8,9]),n=this.safeGetPropertyValue(this.shrink,e),l=this.safeGetPropertyValue(this.alignSelf,i),a=!(!this.radius||!["none","xxs","xs","s","m","l","xl","xxl","round-100","round-200","round-300","round-400","round-600"].includes(this.radius))&&this.radius,h=a&&"var(--ewc-size-radius-"+a+")";return ht`
          :host{
              --ewc-flex-flex: ${at(s||"-")};
              --ewc-flex-grow: ${at(r||"-")};
              --ewc-flex-order: ${at(o||"-")};
              --ewc-flex-shrink: ${at(n||"-")};
              --ewc-flex-align-self: ${at(l||"inherit")};
          }

          .box{ --ewc-box-radius: ${at(h||"0")}; }`}getStyleTag(){return Wt`<style>
        .box {
          display:    ${this.display?this.display:"block"};
          width:      var(--ewc-box-width,        var(--ewc-size-${this.width}));
          max-width:  var(--ewc-box-max-width,    var(--ewc-size-${this.maxWidth}));
          height:     var(--ewc-box-height,       var(--ewc-size-${this.height}, auto));

          margin:               var(--ewc-box-margin,           var(--ewc-size-${this.margin}));
          padding:              var(--ewc-box-padding,          var(--ewc-size-${this.padding}));

          margin-top:           var(--ewc-box-margin-top,       var(--ewc-size-${this.marginTop}));
          margin-bottom:        var(--ewc-box-margin-bottom,    var(--ewc-size-${this.marginBottom}));
          margin-inline-start:  var(--ewc-box-margin-start,     var(--ewc-size-${this.marginStart}));
          margin-inline-end:    var(--ewc-box-margin-end,       var(--ewc-size-${this.marginEnd}));

          padding-top:          var(--ewc-box-padding-top,      var(--ewc-size-${this.paddingTop},    var(--ewc-size-${this.padding})));
          padding-bottom:       var(--ewc-box-padding-bottom,   var(--ewc-size-${this.paddingBottom}, var(--ewc-size-${this.padding})));
          padding-inline-start: var(--ewc-box-padding-start,    var(--ewc-size-${this.paddingStart},  var(--ewc-size-${this.padding})));
          padding-inline-end:   var(--ewc-box-padding-end,      var(--ewc-size-${this.paddingEnd},    var(--ewc-size-${this.padding})));

          background: var(--ewc-box-background,   var(--ewc-color-${this.background}));

          border:     var(--ewc-box-border-width, var(--ewc-size-border-${this.borderWidth}, ${this.borderColor?"1px":"0"}))
                      var(--ewc-box-border-style, solid)
                      var(--ewc-box-border-color, var(--ewc-color-${this.borderColor}, transparent));

        }
        ${this.getSafeStyle()}
      </style>`}constructor(){super(),this.flex=null,this.grow=null,this.shrink=null,this.alignSelf=null,this.order=null,this.radius=null,this.padding=null}render(){return Wt`
        ${this.getStyleTag()}
        <slot class="box"></slot>`}}window.customElements.define("e-box",ae);class he extends ae{static get styles(){return[super.styles,ht`
            .flex {
              display: flex;
            }
            .flex-direction-row            { flex-direction: row }
            .flex-direction-row-reverse    { flex-direction: row-reverse }
            .flex-direction-column         { flex-direction: column }
            .flex-direction-column-reverse { flex-direction: column-reverse }

            .flex-wrap             { flex-wrap: wrap }
            .flex-wrap-reverse     { flex-wrap: wrap-reverse }

            .flex-gap-xs    { gap: var(--ewc-size-gap-xs, var(--ewc-size-12)) }
            .flex-gap-s     { gap: var(--ewc-size-gap-s,  var(--ewc-size-25)) }
            .flex-gap-m     { gap: var(--ewc-size-gap-m,  var(--ewc-size-50)) }
            .flex-gap-l     { gap: var(--ewc-size-gap-m,  var(--ewc-size-100)) }
            .flex-gap-xl    { gap: var(--ewc-size-gap-m,  var(--ewc-size-120)) }
            .flex-gap-xxl   { gap: var(--ewc-size-gap-l,  var(--ewc-size-200)) }
            .flex-gap-xxxl  { gap: var(--ewc-size-gap-xl, var(--ewc-size-300)) }
            .flex-gap-wide  { gap: var(--ewc-size-gap-xxl,  var(--ewc-size-400)) }
            .flex-gap-wide2 { gap: var(--ewc-size-gap-xxxl,  var(--ewc-size-500)) }

            .flex-justify-start    { justify-content: flex-start }
            .flex-justify-end      { justify-content: flex-end }
            .flex-justify-center   { justify-content: center }
            .flex-justify-between  { justify-content: space-between }
            .flex-justify-around   { justify-content: space-around }
            .flex-justify-evenly   { justify-content: space-evenly }

            .flex-items-start      { align-items: flex-start }
            .flex-items-end        { align-items: flex-end }
            .flex-items-center     { align-items: center }
            .flex-items-baseline   { align-items: baseline }
            .flex-items-stretch    { align-items: stretch }

            .flex-content-start    { align-content: flex-start }
            .flex-content-end      { align-content: flex-end }
            .flex-content-center   { align-content: center }
            .flex-content-between  { align-content: space-between }
            .flex-content-around   { align-content: space-around }
            .flex-content-around   { align-content: space-evenly }
            .flex-content-stretch  { align-content: stretch }

            ::slotted(*) {
                flex: var(--ewc-flex-flex);
                flex-grow: var(--ewc-flex-grow);
                flex-shrink: var(--ewc-flex-shrink);
                align-self: var(--ewc-flex-align-self);
                order: var(--ewc-flex-order);
                height: 100%;
            }

            // Item
            .flex-flex-grow       { flex: auto }
            .flex-flex-shrink     { flex: 0 auto }
            .flex-flex-inflexible { flex: none }
            .flex-flex-flexible   { flex: 1 }

            .flex-1        { flex: 1 }
            .flex-auto     { flex: auto }
            .flex-grow-0   { flex-grow: 0 }
            .flex-shrink-0 { flex-shrink: 0 }

            .flex-self-auto     { align-self: auto }
            .flex-self-start    { align-self: flex-start }
            .flex-self-end      { align-self: flex-end }
            .flex-self-center   { align-self: center }
            .flex-self-baseline { align-self: baseline }
            .flex-self-stretch  { align-self: stretch }

            .flex-order-0 { order: 0 }
            .flex-order-1 { order: 10 }
            .flex-order-2 { order: 20 }
            .flex-order-3 { order: 30 }
            .flex-order-4 { order: 40 }
            .flex-order-5 { order: 50 }
            .flex-order-6 { order: 60 }
            .flex-order-7 { order: 70 }
            .flex-order-8 { order: 80 }
            .flex-order-9 { order: 90 }
            .flex-order-10{ order: 100 }
            .flex-order-none { order: inherit }
        `]}static get properties(){return{alignItems:{type:String,reflect:!0},alignContent:{type:String,reflect:!0},direction:{type:String,reflect:!0},flex:{type:String,reflect:!0},fullWidth:{type:Boolean,reflect:!0},gap:{type:String,reflect:!0},grow:{type:String,reflect:!0},justifyContent:{type:String,reflect:!0},shrink:{type:String,reflect:!0},wrap:{type:Boolean,reflect:!0},wrapReverse:{type:Boolean,reflect:!0}}}constructor(){super(),this.direction=null,this.flex=null,this.gap=null,this.justifyContent=null,this.alignContent=null,this.alignItems=null,this.wrap=null,this.grow=null,this.shrink=null,this.alignSelf=null}render(){const t=this.direction&&"flex-direction-"+this.direction,e=this.flex&&"flex-flex-"+this.flex,i=this.gap&&"flex-gap-"+this.gap,s=this.justifyContent&&"flex-justify-"+this.justifyContent,r=this.alignContent&&"flex-content-"+this.alignContent,o=this.alignItems&&"flex-items-"+this.alignItems,n=this.wrap&&"flex-wrap",l=this.wrapReverse&&"flex-wrap-reverse",a=this.grow&&"flex-grow-"+this.grow,h=this.shrink&&"flex-shrink-"+this.shrink,c=this.alignSelf&&"flex-self-"+this.alignSelf;return Wt`
      ${this.getStyleTag()}
      <div class="box">
        <slot class="flex ${t} ${s} ${e} ${i} ${r} ${o} ${n} ${l} ${a} ${h} ${c}"></slot>
      </div>`}}window.customElements.define("e-flex",he);export{ae as Box,le as Button,he as Flex,it as Heading};
