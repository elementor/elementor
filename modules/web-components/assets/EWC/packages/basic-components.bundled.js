/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t,i,e,s;const o=globalThis.trustedTypes,n=o?o.createPolicy("lit-html",{createHTML:t=>t}):void 0,r=`lit$${(Math.random()+"").slice(9)}$`,l="?"+r,h=`<${l}>`,c=document,a=(t="")=>c.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,p=/>/g,w=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,g=/'/g,b=/"/g,y=/^(?:script|style|textarea)$/i,m=(t=>(i,...e)=>({_$litType$:t,strings:i,values:e}))(1),x=Symbol.for("lit-noChange"),S=Symbol.for("lit-nothing"),z=new WeakMap,$=c.createTreeWalker(c,129,null,!1);class C{constructor({strings:t,_$litType$:i},e){let s;this.parts=[];let c=0,d=0;const u=t.length-1,m=this.parts,[x,S]=((t,i)=>{const e=t.length-1,s=[];let o,l=2===i?"<svg>":"",c=v;for(let i=0;i<e;i++){const e=t[i];let n,a,d=-1,u=0;for(;u<e.length&&(c.lastIndex=u,a=c.exec(e),null!==a);)u=c.lastIndex,c===v?"!--"===a[1]?c=f:void 0!==a[1]?c=p:void 0!==a[2]?(y.test(a[2])&&(o=RegExp("</"+a[2],"g")),c=w):void 0!==a[3]&&(c=w):c===w?">"===a[0]?(c=null!=o?o:v,d=-1):void 0===a[1]?d=-2:(d=c.lastIndex-a[2].length,n=a[1],c=void 0===a[3]?w:'"'===a[3]?b:g):c===b||c===g?c=w:c===f||c===p?c=v:(c=w,o=void 0);const m=c===w&&t[i+1].startsWith("/>")?" ":"";l+=c===v?e+h:d>=0?(s.push(n),e.slice(0,d)+"$lit$"+e.slice(d)+r+m):e+r+(-2===d?(s.push(void 0),i):m)}const a=l+(t[e]||"<?>")+(2===i?"</svg>":"");return[void 0!==n?n.createHTML(a):a,s]})(t,i);if(this.el=C.createElement(x,e),$.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(s=$.nextNode())&&m.length<u;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const i of s.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(r)){const e=S[d++];if(t.push(i),void 0!==e){const t=s.getAttribute(e.toLowerCase()+"$lit$").split(r),i=/([.?@])?(.*)/.exec(e);m.push({type:1,index:c,name:i[2],strings:t,ctor:"."===i[1]?j:"?"===i[1]?E:"@"===i[1]?A:M})}else m.push({type:6,index:c})}for(const i of t)s.removeAttribute(i)}if(y.test(s.tagName)){const t=s.textContent.split(r),i=t.length-1;if(i>0){s.textContent=o?o.emptyScript:"";for(let e=0;e<i;e++)s.append(t[e],a()),$.nextNode(),m.push({type:2,index:++c});s.append(t[i],a())}}}else if(8===s.nodeType)if(s.data===l)m.push({type:2,index:c});else{let t=-1;for(;-1!==(t=s.data.indexOf(r,t+1));)m.push({type:7,index:c}),t+=r.length-1}c++}}static createElement(t,i){const e=c.createElement("template");return e.innerHTML=t,e}}function k(t,i,e=t,s){var o,n,r,l;if(i===x)return i;let h=void 0!==s?null===(o=e.Σi)||void 0===o?void 0:o[s]:e.Σo;const c=d(i)?void 0:i._$litDirective$;return(null==h?void 0:h.constructor)!==c&&(null===(n=null==h?void 0:h.O)||void 0===n||n.call(h,!1),void 0===c?h=void 0:(h=new c(t),h.T(t,e,s)),void 0!==s?(null!==(r=(l=e).Σi)&&void 0!==r?r:l.Σi=[])[s]=h:e.Σo=h),void 0!==h&&(i=k(t,h.S(t,i.values),h,s)),i}class T{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:e},parts:s}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:c).importNode(e,!0);$.currentNode=o;let n=$.nextNode(),r=0,l=0,h=s[0];for(;void 0!==h;){if(r===h.index){let i;2===h.type?i=new _(n,n.nextSibling,this,t):1===h.type?i=new h.ctor(n,h.name,h.strings,this,t):6===h.type&&(i=new O(n,this,t)),this.l.push(i),h=s[++l]}r!==(null==h?void 0:h.index)&&(n=$.nextNode(),r++)}return o}v(t){let i=0;for(const e of this.l)void 0!==e&&(void 0!==e.strings?(e.I(t,e,i),i+=e.strings.length-2):e.I(t[i])),i++}}class _{constructor(t,i,e,s){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=e,this.options=s}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=k(this,t,i),d(t)?t===S||null==t||""===t?(this.H!==S&&this.R(),this.H=S):t!==this.H&&t!==x&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return u(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(c.createTextNode(t)),this.H=t}_(t){var i;const{values:e,_$litType$:s}=t,o="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=C.createElement(s.h,this.options)),s);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(e);else{const t=new T(o,this),i=t.u(this.options);t.v(e),this.$(i),this.H=t}}C(t){let i=z.get(t.strings);return void 0===i&&z.set(t.strings,i=new C(t)),i}g(t){u(this.H)||(this.H=[],this.R());const i=this.H;let e,s=0;for(const o of t)s===i.length?i.push(e=new _(this.k(a()),this.k(a()),this,this.options)):e=i[s],e.I(o),s++;s<i.length&&(this.R(e&&e.B.nextSibling,s),i.length=s)}R(t=this.A.nextSibling,i){var e;for(null===(e=this.P)||void 0===e||e.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class M{constructor(t,i,e,s,o){this.type=1,this.H=S,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=s,this.options=o,e.length>2||""!==e[0]||""!==e[1]?(this.H=Array(e.length-1).fill(S),this.strings=e):this.H=S}get tagName(){return this.element.tagName}I(t,i=this,e,s){const o=this.strings;let n=!1;if(void 0===o)t=k(this,t,i,0),n=!d(t)||t!==this.H&&t!==x,n&&(this.H=t);else{const s=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=k(this,s[e+r],i,r),l===x&&(l=this.H[r]),n||(n=!d(l)||l!==this.H[r]),l===S?t=S:t!==S&&(t+=(null!=l?l:"")+o[r+1]),this.H[r]=l}n&&!s&&this.W(t)}W(t){t===S?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class j extends M{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===S?void 0:t}}class E extends M{constructor(){super(...arguments),this.type=4}W(t){t&&t!==S?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class A extends M{constructor(){super(...arguments),this.type=5}I(t,i=this){var e;if((t=null!==(e=k(this,t,i,0))&&void 0!==e?e:S)===x)return;const s=this.H,o=t===S&&s!==S||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==S&&(s===S||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,e;"function"==typeof this.H?this.H.call(null!==(e=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==e?e:this.element,t):this.H.handleEvent(t)}}class O{constructor(t,i,e){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=e}I(t){k(this,t)}}null===(i=(t=globalThis).litHtmlPlatformSupport)||void 0===i||i.call(t,C,_),(null!==(e=(s=globalThis).litHtmlVersions)&&void 0!==e?e:s.litHtmlVersions=[]).push("2.0.0-rc.2");
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,U=Symbol();class P{constructor(t,i){if(i!==U)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return I&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const N=t=>new P(t+"",U),R=new Map,W=(t,...i)=>{const e=i.reduce(((i,e,s)=>i+(t=>{if(t instanceof P)return t.cssText;if("number"==typeof t)return t;throw Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(e)+t[s+1]),t[0]);let s=R.get(e);return void 0===s&&R.set(e,s=new P(e,U)),s},L=I?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const e of t.cssRules)i+=e.cssText;return N(i)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var B,q,V,F;const H={toAttribute(t,i){switch(i){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let e=t;switch(i){case Boolean:e=null!==t;break;case Number:e=null===t?null:Number(t);break;case Object:case Array:try{e=JSON.parse(t)}catch(t){e=null}}return e}},J=(t,i)=>i!==t&&(i==i||t==t),D={attribute:!0,type:String,converter:H,reflect:!1,hasChanged:J};class Z extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var i;null!==(i=this.v)&&void 0!==i||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,e)=>{const s=this.Πp(e,i);void 0!==s&&(this.Πm.set(s,e),t.push(s))})),t}static createProperty(t,i=D){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const e="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,e,i);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,i,e){return{get(){return this[i]},set(s){const o=this[t];this[i]=s,this.requestUpdate(t,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||D}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const e of i)this.createProperty(e,t[e])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const e=new Set(t.flat(1/0).reverse());for(const t of e)i.unshift(L(t))}else void 0!==t&&i.push(L(t));return i}static Πp(t,i){const e=i.attribute;return!1===e?void 0:"string"==typeof e?e:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,e;(null!==(i=this.ΠU)&&void 0!==i?i:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(e=t.hostConnected)||void 0===e||e.call(t))}removeController(t){var i;null===(i=this.ΠU)||void 0===i||i.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this.Πi.set(i,this[i]),delete this[i])}))}createRenderRoot(){var t;const i=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{I?t.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):i.forEach((i=>{const e=document.createElement("style");e.textContent=i.cssText,t.appendChild(e)}))})(i,this.constructor.elementStyles),i}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,i,e){this.K(t,e)}Πj(t,i,e=D){var s,o;const n=this.constructor.Πp(t,e);if(void 0!==n&&!0===e.reflect){const r=(null!==(o=null===(s=e.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==o?o:H.toAttribute)(i,e.type);this.Πh=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this.Πh=null}}K(t,i){var e,s,o;const n=this.constructor,r=n.Πm.get(t);if(void 0!==r&&this.Πh!==r){const t=n.getPropertyOptions(r),l=t.converter,h=null!==(o=null!==(s=null===(e=l)||void 0===e?void 0:e.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==o?o:H.fromAttribute;this.Πh=r,this[r]=h(i,t.type),this.Πh=null}}requestUpdate(t,i,e){let s=!0;void 0!==t&&(((e=e||this.constructor.getPropertyOptions(t)).hasChanged||J)(this[t],i)?(this.L.has(t)||this.L.set(t,i),!0===e.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,e))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,i)=>this[i]=t)),this.Πi=void 0);let i=!1;const e=this.L;try{i=this.shouldUpdate(e),i?(this.willUpdate(e),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(e)):this.Π$()}catch(t){throw i=!1,this.Π$(),t}i&&this.E(e)}willUpdate(t){}E(t){var i;null===(i=this.ΠU)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,i)=>this.Πj(i,this[i],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var G,K,Q,X,Y,tt;Z.finalized=!0,Z.shadowRootOptions={mode:"open"},null===(q=(B=globalThis).reactiveElementPlatformSupport)||void 0===q||q.call(B,{ReactiveElement:Z}),(null!==(V=(F=globalThis).reactiveElementVersions)&&void 0!==V?V:F.reactiveElementVersions=[]).push("1.0.0-rc.1"),(null!==(G=(tt=globalThis).litElementVersions)&&void 0!==G?G:tt.litElementVersions=[]).push("3.0.0-rc.1");class it extends Z{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,i;const e=super.createRenderRoot();return null!==(t=(i=this.renderOptions).renderBefore)&&void 0!==t||(i.renderBefore=e.firstChild),e}update(t){const i=this.render();super.update(t),this.Φt=((t,i,e)=>{var s,o;const n=null!==(s=null==e?void 0:e.renderBefore)&&void 0!==s?s:i;let r=n._$litPart$;if(void 0===r){const t=null!==(o=null==e?void 0:e.renderBefore)&&void 0!==o?o:null;n._$litPart$=r=new _(i.insertBefore(a(),t),t,void 0,e)}return r.I(t),r})(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return x}}it.finalized=!0,it._$litElement$=!0,null===(Q=(K=globalThis).litElementHydrateSupport)||void 0===Q||Q.call(K,{LitElement:it}),null===(Y=(X=globalThis).litElementPlatformSupport)||void 0===Y||Y.call(X,{LitElement:it});class et extends it{static get styles(){return W`
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
				margin-bottom: var(--ewc-heading-margin-bottom, var(--ewc-heading-margin-bottom-default, var(--ewc-size-5)));
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
				--ewc-heading-margin-bottom-default: 0; }`}static get properties(){return{align:{type:String,reflect:!0},color:{type:String,reflect:!0},font:{type:String,reflect:!0},italic:{type:Boolean,reflect:!0},level:{type:String,reflect:!0},size:{type:String,reflect:!0},transform:{type:String,reflect:!0},weight:{type:String,reflect:!0}}}safeGetPropertyValue(t,i){return t?i[t]?i[t]:[...i.keys()].includes(t)?t:"":""}getColorStyle(){const t=[];t.green="green-500",t.celery="celery-500",t.chartreuse="chartreuse-500",t.seafoam="seafoam-500",t.blue="blue-500",t.purple="purple-500",t.indigo="indigo-500",t.fucsia="fucsia-500",t.magenta="magenta-500",t.red="red-500",t.orange="orange-500",t.yellow="yellow-500",t.primary="primary",t.secondary="secondary",t.cta="cta",t.success="success",t.warning="warning",t.danger="danger",t.info="info";const i="var(--ewc-color-"+this.safeGetPropertyValue(this.color,t)+")";return W`h1, h2, h3, h4, h5, h6 {
			color: var( --ewc-heading-color, ${N(i)}) !important;
		}`}getFlexItemStyle(){const t=[];t.grow="auto",t.shrink="0 auto",t.stiff="none",t.flexible="1";const i=[0,1,2,3,4,5,6],e=[];e.auto="auto",e.start="flex-start",e.end="flex-end",e.center="center",e.baseline="baseline",e.stretch="stretch";const s=this.safeGetPropertyValue(this.flex,t),o=this.safeGetPropertyValue(this.grow,i),n=this.safeGetPropertyValue(this.order,[0,1,2,3,4,5,6,7,8,9]),r=this.safeGetPropertyValue(this.shrink,i),l=this.safeGetPropertyValue(this.alignSelf,e);return W`:host{
			--ewc-flex-flex: ${N(s)};
			--ewc-flex-grow: ${N(o)};
			--ewc-flex-order: ${N(n)};
			--ewc-flex-shrink: ${N(r)};
			--ewc-flex-align-self: ${N(l)};
		}`}constructor(){super(),this.level="2",this.color="gray-900",this.flex=null,this.grow=null,this.shrink=null,this.alignSelf=null,this.order=null}headingTemplate(t){let i=m`<h2>${t}</h2>`;switch(this.level){case"1":i=m`<h1>${t}</h1>`;break;case"2":i=m`<h2>${t}</h2>`;break;case"3":i=m`<h3>${t}</h3>`;break;case"4":i=m`<h4>${t}</h4>`;break;case"5":i=m`<h5>${t}</h5>`;break;case"6":i=m`<h6>${t}</h6>`}return i}render(){const t=m`<slot></slot>`;return m`
			<style>
				${this.getFlexItemStyle()}
				${this.getColorStyle()}
			</style>
			${this.headingTemplate(t)}`}}window.customElements.define("e-heading",et);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const st=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol();class nt{constructor(t,i){if(i!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return st&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const rt=new Map,lt=t=>{let i=rt.get(t);return void 0===i&&rt.set(t,i=new nt(t,ot)),i},ht=t=>lt("string"==typeof t?t:t+""),ct=(t,...i)=>{const e=1===t.length?t[0]:i.reduce(((i,e,s)=>i+(t=>{if(t instanceof nt)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(e)+t[s+1]),t[0]);return lt(e)},at=st?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const e of t.cssRules)i+=e.cssText;return ht(i)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var dt,ut,vt,ft;const pt={toAttribute(t,i){switch(i){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let e=t;switch(i){case Boolean:e=null!==t;break;case Number:e=null===t?null:Number(t);break;case Object:case Array:try{e=JSON.parse(t)}catch(t){e=null}}return e}},wt=(t,i)=>i!==t&&(i==i||t==t),gt={attribute:!0,type:String,converter:pt,reflect:!1,hasChanged:wt};class bt extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var i;null!==(i=this.v)&&void 0!==i||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,e)=>{const s=this.Πp(e,i);void 0!==s&&(this.Πm.set(s,e),t.push(s))})),t}static createProperty(t,i=gt){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const e="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,e,i);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,i,e){return{get(){return this[i]},set(s){const o=this[t];this[i]=s,this.requestUpdate(t,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||gt}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const e of i)this.createProperty(e,t[e])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const e=new Set(t.flat(1/0).reverse());for(const t of e)i.unshift(at(t))}else void 0!==t&&i.push(at(t));return i}static Πp(t,i){const e=i.attribute;return!1===e?void 0:"string"==typeof e?e:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,e;(null!==(i=this.ΠU)&&void 0!==i?i:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(e=t.hostConnected)||void 0===e||e.call(t))}removeController(t){var i;null===(i=this.ΠU)||void 0===i||i.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this.Πi.set(i,this[i]),delete this[i])}))}createRenderRoot(){var t;const i=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{st?t.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):i.forEach((i=>{const e=document.createElement("style");e.textContent=i.cssText,t.appendChild(e)}))})(i,this.constructor.elementStyles),i}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,i,e){this.K(t,e)}Πj(t,i,e=gt){var s,o;const n=this.constructor.Πp(t,e);if(void 0!==n&&!0===e.reflect){const r=(null!==(o=null===(s=e.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==o?o:pt.toAttribute)(i,e.type);this.Πh=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this.Πh=null}}K(t,i){var e,s,o;const n=this.constructor,r=n.Πm.get(t);if(void 0!==r&&this.Πh!==r){const t=n.getPropertyOptions(r),l=t.converter,h=null!==(o=null!==(s=null===(e=l)||void 0===e?void 0:e.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==o?o:pt.fromAttribute;this.Πh=r,this[r]=h(i,t.type),this.Πh=null}}requestUpdate(t,i,e){let s=!0;void 0!==t&&(((e=e||this.constructor.getPropertyOptions(t)).hasChanged||wt)(this[t],i)?(this.L.has(t)||this.L.set(t,i),!0===e.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,e))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,i)=>this[i]=t)),this.Πi=void 0);let i=!1;const e=this.L;try{i=this.shouldUpdate(e),i?(this.willUpdate(e),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(e)):this.Π$()}catch(t){throw i=!1,this.Π$(),t}i&&this.E(e)}willUpdate(t){}E(t){var i;null===(i=this.ΠU)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,i)=>this.Πj(i,this[i],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var yt,mt,xt,St;bt.finalized=!0,bt.elementProperties=new Map,bt.elementStyles=[],bt.shadowRootOptions={mode:"open"},null===(ut=(dt=globalThis).reactiveElementPlatformSupport)||void 0===ut||ut.call(dt,{ReactiveElement:bt}),(null!==(vt=(ft=globalThis).reactiveElementVersions)&&void 0!==vt?vt:ft.reactiveElementVersions=[]).push("1.0.0-rc.2");const zt=globalThis.trustedTypes,$t=zt?zt.createPolicy("lit-html",{createHTML:t=>t}):void 0,Ct=`lit$${(Math.random()+"").slice(9)}$`,kt="?"+Ct,Tt=`<${kt}>`,_t=document,Mt=(t="")=>_t.createComment(t),jt=t=>null===t||"object"!=typeof t&&"function"!=typeof t,Et=Array.isArray,At=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ot=/-->/g,It=/>/g,Ut=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,Pt=/'/g,Nt=/"/g,Rt=/^(?:script|style|textarea)$/i,Wt=(t=>(i,...e)=>({_$litType$:t,strings:i,values:e}))(1),Lt=Symbol.for("lit-noChange"),Bt=Symbol.for("lit-nothing"),qt=new WeakMap,Vt=_t.createTreeWalker(_t,129,null,!1);class Ft{constructor({strings:t,_$litType$:i},e){let s;this.parts=[];let o=0,n=0;const r=t.length-1,l=this.parts,[h,c]=((t,i)=>{const e=t.length-1,s=[];let o,n=2===i?"<svg>":"",r=At;for(let i=0;i<e;i++){const e=t[i];let l,h,c=-1,a=0;for(;a<e.length&&(r.lastIndex=a,h=r.exec(e),null!==h);)a=r.lastIndex,r===At?"!--"===h[1]?r=Ot:void 0!==h[1]?r=It:void 0!==h[2]?(Rt.test(h[2])&&(o=RegExp("</"+h[2],"g")),r=Ut):void 0!==h[3]&&(r=Ut):r===Ut?">"===h[0]?(r=null!=o?o:At,c=-1):void 0===h[1]?c=-2:(c=r.lastIndex-h[2].length,l=h[1],r=void 0===h[3]?Ut:'"'===h[3]?Nt:Pt):r===Nt||r===Pt?r=Ut:r===Ot||r===It?r=At:(r=Ut,o=void 0);const d=r===Ut&&t[i+1].startsWith("/>")?" ":"";n+=r===At?e+Tt:c>=0?(s.push(l),e.slice(0,c)+"$lit$"+e.slice(c)+Ct+d):e+Ct+(-2===c?(s.push(void 0),i):d)}const l=n+(t[e]||"<?>")+(2===i?"</svg>":"");return[void 0!==$t?$t.createHTML(l):l,s]})(t,i);if(this.el=Ft.createElement(h,e),Vt.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(s=Vt.nextNode())&&l.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const i of s.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(Ct)){const e=c[n++];if(t.push(i),void 0!==e){const t=s.getAttribute(e.toLowerCase()+"$lit$").split(Ct),i=/([.?@])?(.*)/.exec(e);l.push({type:1,index:o,name:i[2],strings:t,ctor:"."===i[1]?Gt:"?"===i[1]?Kt:"@"===i[1]?Qt:Zt})}else l.push({type:6,index:o})}for(const i of t)s.removeAttribute(i)}if(Rt.test(s.tagName)){const t=s.textContent.split(Ct),i=t.length-1;if(i>0){s.textContent=zt?zt.emptyScript:"";for(let e=0;e<i;e++)s.append(t[e],Mt()),Vt.nextNode(),l.push({type:2,index:++o});s.append(t[i],Mt())}}}else if(8===s.nodeType)if(s.data===kt)l.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(Ct,t+1));)l.push({type:7,index:o}),t+=Ct.length-1}o++}}static createElement(t,i){const e=_t.createElement("template");return e.innerHTML=t,e}}function Ht(t,i,e=t,s){var o,n,r,l;if(i===Lt)return i;let h=void 0!==s?null===(o=e.Σi)||void 0===o?void 0:o[s]:e.Σo;const c=jt(i)?void 0:i._$litDirective$;return(null==h?void 0:h.constructor)!==c&&(null===(n=null==h?void 0:h.O)||void 0===n||n.call(h,!1),void 0===c?h=void 0:(h=new c(t),h.T(t,e,s)),void 0!==s?(null!==(r=(l=e).Σi)&&void 0!==r?r:l.Σi=[])[s]=h:e.Σo=h),void 0!==h&&(i=Ht(t,h.S(t,i.values),h,s)),i}class Jt{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:e},parts:s}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:_t).importNode(e,!0);Vt.currentNode=o;let n=Vt.nextNode(),r=0,l=0,h=s[0];for(;void 0!==h;){if(r===h.index){let i;2===h.type?i=new Dt(n,n.nextSibling,this,t):1===h.type?i=new h.ctor(n,h.name,h.strings,this,t):6===h.type&&(i=new Xt(n,this,t)),this.l.push(i),h=s[++l]}r!==(null==h?void 0:h.index)&&(n=Vt.nextNode(),r++)}return o}v(t){let i=0;for(const e of this.l)void 0!==e&&(void 0!==e.strings?(e.I(t,e,i),i+=e.strings.length-2):e.I(t[i])),i++}}class Dt{constructor(t,i,e,s){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=e,this.options=s}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=Ht(this,t,i),jt(t)?t===Bt||null==t||""===t?(this.H!==Bt&&this.R(),this.H=Bt):t!==this.H&&t!==Lt&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return Et(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(_t.createTextNode(t)),this.H=t}_(t){var i;const{values:e,_$litType$:s}=t,o="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=Ft.createElement(s.h,this.options)),s);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(e);else{const t=new Jt(o,this),i=t.u(this.options);t.v(e),this.$(i),this.H=t}}C(t){let i=qt.get(t.strings);return void 0===i&&qt.set(t.strings,i=new Ft(t)),i}g(t){Et(this.H)||(this.H=[],this.R());const i=this.H;let e,s=0;for(const o of t)s===i.length?i.push(e=new Dt(this.k(Mt()),this.k(Mt()),this,this.options)):e=i[s],e.I(o),s++;s<i.length&&(this.R(e&&e.B.nextSibling,s),i.length=s)}R(t=this.A.nextSibling,i){var e;for(null===(e=this.P)||void 0===e||e.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class Zt{constructor(t,i,e,s,o){this.type=1,this.H=Bt,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=s,this.options=o,e.length>2||""!==e[0]||""!==e[1]?(this.H=Array(e.length-1).fill(Bt),this.strings=e):this.H=Bt}get tagName(){return this.element.tagName}I(t,i=this,e,s){const o=this.strings;let n=!1;if(void 0===o)t=Ht(this,t,i,0),n=!jt(t)||t!==this.H&&t!==Lt,n&&(this.H=t);else{const s=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=Ht(this,s[e+r],i,r),l===Lt&&(l=this.H[r]),n||(n=!jt(l)||l!==this.H[r]),l===Bt?t=Bt:t!==Bt&&(t+=(null!=l?l:"")+o[r+1]),this.H[r]=l}n&&!s&&this.W(t)}W(t){t===Bt?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Gt extends Zt{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===Bt?void 0:t}}class Kt extends Zt{constructor(){super(...arguments),this.type=4}W(t){t&&t!==Bt?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class Qt extends Zt{constructor(){super(...arguments),this.type=5}I(t,i=this){var e;if((t=null!==(e=Ht(this,t,i,0))&&void 0!==e?e:Bt)===Lt)return;const s=this.H,o=t===Bt&&s!==Bt||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==Bt&&(s===Bt||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,e;"function"==typeof this.H?this.H.call(null!==(e=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==e?e:this.element,t):this.H.handleEvent(t)}}class Xt{constructor(t,i,e){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=e}I(t){Ht(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Yt,ti,ii,ei,si,oi;null===(mt=(yt=globalThis).litHtmlPlatformSupport)||void 0===mt||mt.call(yt,Ft,Dt),(null!==(xt=(St=globalThis).litHtmlVersions)&&void 0!==xt?xt:St.litHtmlVersions=[]).push("2.0.0-rc.3"),(null!==(Yt=(oi=globalThis).litElementVersions)&&void 0!==Yt?Yt:oi.litElementVersions=[]).push("3.0.0-rc.2");class ni extends bt{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,i;const e=super.createRenderRoot();return null!==(t=(i=this.renderOptions).renderBefore)&&void 0!==t||(i.renderBefore=e.firstChild),e}update(t){const i=this.render();super.update(t),this.Φt=((t,i,e)=>{var s,o;const n=null!==(s=null==e?void 0:e.renderBefore)&&void 0!==s?s:i;let r=n._$litPart$;if(void 0===r){const t=null!==(o=null==e?void 0:e.renderBefore)&&void 0!==o?o:null;n._$litPart$=r=new Dt(i.insertBefore(Mt(),t),t,void 0,e)}return r.I(t),r})(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return Lt}}ni.finalized=!0,ni._$litElement$=!0,null===(ii=(ti=globalThis).litElementHydrateSupport)||void 0===ii||ii.call(ti,{LitElement:ni}),null===(si=(ei=globalThis).litElementPlatformSupport)||void 0===si||si.call(ei,{LitElement:ni});const ri=ct`
  ::slotted(*) {
	z-index: 2;
	color: inherit !important;
	text-decoration: none !important;
  }

  slot:not([name]) {
	order: 2;
	display: inline-block;
	z-index: 2;
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
	vertical-align: middle;
	border-style: solid;
	white-space: nowrap;
	cursor: pointer;
	appearance: none;
	user-select: none;
	gap: var(--ewc-btn-gap, .5em);
	padding: var(--ewc-btn-padding, var(--ewc-alias-btn-padding, 7px 19px));
	font-size: var(--ewc-btn-font-size, var(--ewc-alias-btn-font-size, .875rem));
	font-weight: var(--ewc-btn-font-weight, 600);
	line-height: var(--ewc-btn-line-height, 20px);
	border-width: var(--ewc-btn-border-width, 2px);
	border-color: var(--ewc-btn-color, var(--ewc-alias-btn-color, var(--ewc-color-gray-300)));
	border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
	box-shadow: var(--ewc-btn-shadow, none), var(--ewc-btn-inset-shadow, none);
	transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
	transition-property: color, background-color, border-color;
  }

  :host:before {
	content: '';
	display: block;
	position: absolute;
	inset: calc(-1 * var(--ewc-btn-border-width, 2px));
	z-index: 1;
	border-radius: inherit;
	outline-color: var(--ewc-btn-focus-color,
		var(--ewc-btn-color,
		var(--ewc-alias-btn-color,
		var(--ewc-color-primary,
		currentColor))));
	outline-width: calc( var(--ewc-btn-focus-ring-width, var(--ewc-size-border-thick, 3px)) * var(--ewc-btn-focus-state, 0));
	outline-style: solid;
	opacity: calc( var( --ewc-btn-focus-ring-opacity, 0.33) * var(--ewc-btn-focus-state, 0));
	transition: opacity .1s, outline-width .2s;
  }

  /* Default button */

  :host([size="tiny"])    { --ewc-alias-btn-padding: 0 8px;     --ewc-alias-btn-font-size: .6875rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-xs)}
  :host([size="mini"])    { --ewc-alias-btn-padding: 2px 12px;  --ewc-alias-btn-font-size: .75rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
  :host([size="small"])   { --ewc-alias-btn-padding: 4px 14px;  --ewc-alias-btn-font-size: .8125rem;  --ewc-alias-btn-radius: var(--ewc-size-radius-s)}
  :host([size="medium"])  { --ewc-alias-btn-padding: 8px 18px;  --ewc-alias-btn-font-size: .9rem;     --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
  :host([size="large"])   { --ewc-alias-btn-padding: 12px 20px; --ewc-alias-btn-font-size: 1.1225rem; --ewc-alias-btn-radius: var(--ewc-size-radius-m)}
  :host([size="big"])     { --ewc-alias-btn-padding: 16px 24px; --ewc-alias-btn-font-size: 1.25rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
  :host([size="huge"])    { --ewc-alias-btn-padding: 20px 32px; --ewc-alias-btn-font-size: 1.5rem;    --ewc-alias-btn-radius: var(--ewc-size-radius-l)}
  :host([size="massive"]) { --ewc-alias-btn-padding: 24px 36px; --ewc-alias-btn-font-size: 1.75rem;   --ewc-alias-btn-radius: var(--ewc-size-radius-l)}

  :host([color="primary"])   { --ewc-alias-btn-color: var(--ewc-color-primary)}
  :host([color="secondary"]) { --ewc-alias-btn-color: var(--ewc-color-secondary)}
  :host([color="danger"])    { --ewc-alias-btn-color: var(--ewc-color-danger)}
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

  :host([pill]) {
	--ewc-alias-btn-radius: var(--ewc-size-radius-round-600, 6rem);
  }

  :host([quiet]) {
	border-color: transparent;
	--ewc-btn-color-brightness: .95;
  }

  :host(:is([color="default"], :not([color]))) {
	color: var(--ewc-color-gray-800);
  }

  .bg-layer {
	background-color: var(--ewc-btn-bg-layer-color, currentColor);
	opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
	transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
	border-radius: var(--ewc-btn-radius, var(--ewc-alias-btn-radius, var(--ewc-size-radius-m, 6px)));
  }

  :host(:not(:is([outline],[quiet]))) .bg-layer {
	background-color: black;
	mix-blend-mode: multiply;
	opacity: calc(1 - var(--ewc-btn-color-brightness, 1));
  }

  :host(:is(:hover,[hover])) {
	--ewc-btn-color-brightness: .9;
	transition-duration: 0.1s;
  }

  :host(:active), :host(:active) .bg-layer {
	--ewc-btn-color-brightness: .8;
	transition: none;
  }

  :host(:is(.selected, [selected], [aria-selected=true])) {
	--ewc-btn-color-brightness: .8;
	box-shadow: var(--color-shadow-inset);
  }

  :host(:is(.disabled, [disabled] :disabled, [aria-disabled=true])) {
	color: var(--color-text-disabled);
	background-color: var(--color-btn-bg);
	border-color: var(--color-btn-border);
  }

  :host(:focus),
  ::slotted(a:focus) {
	outline: 0 none;
  }

  :host([focused]) {
	--ewc-btn-focus-state: 1;
  }

  :host(:hover) { text-decoration: none; }

  :host(:is(:disabled, .disabled, [aria-disabled=true], [disabled])) {
	opacity: 0.75;
	cursor: default;
  }

  :host([grow]) {
	width: 100%;
	--ewc-flex-grow: 1;
  }

  i {
	font-style: normal;
	font-weight: 600;
	opacity: 0.75;
  }

  ::slotted(e-icon) {
	--ewc-alias-icon-padding: 0;
  }`;class li extends ni{static styles=[ri];static get properties(){return{focused:{type:Boolean,reflect:!0},tabIndex:{type:Number,reflect:!0}}}constructor(){super(),this.tabIndex=0,this.focused=!1,this.addEventListener("focus",(t=>{this._handleFocus(t)})),this.addEventListener("focusout",(t=>{this._handleBlur(t)}))}_handleFocus(t){t.target.matches(":focus-visible")&&(this._slottedLink&&(this.tabIndex=-1,this._slottedLink.focus()),this.focused=!0)}_handleBlur(t){this._slottedLink&&t.target===this._slottedLink&&(this.tabIndex=0),this.focused=!1}get _slottedLink(){const t=this.shadowRoot.querySelectorAll("slot");let i=!1;return t.forEach((t=>{const e=t.assignedNodes({flatten:!0});e.length&&"A"===e[0].nodeName&&(i=e[0])})),i}render(){return Wt`
			<div class="bg-layer"></div>
			<slot name="icon"></slot>
			<slot></slot>`}}window.customElements.define("e-button",li);class hi extends ni{static get styles(){return ct`
		  :host { display: block }
          :host {
			border-radius: var(--ewc-box-radius, var(--ewc-box-radius-alias));
			flex-shrink: var(--ewc-flex-shrink, 0) }
          :host([elevation="subtle"]) { box-shadow: rgba(0, 0, 0, 0.08)  0 1px 2px 0; }
          :host([elevation="paper"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 1px 3px 0, rgba(0, 0, 0, 0.06) 0 1px 2px 0; }
          :host([elevation="card"])   { box-shadow: rgba(0, 0, 0, 0.1)   0 4px 6px -1px, rgba(0, 0, 0, 0.06) 0 2px 4px -1px; }
          :host([elevation="panel"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px; }
          :host([elevation="float"])  { box-shadow: rgba(0, 0, 0, 0.1)   0 20px 25px -5px, rgba(0, 0, 0, 0.04) 0 10px 10px -5px; }
          :host([elevation="air"])    { box-shadow: rgba(0, 0, 0, 0.25)  0 25px 50px -12px; }

		  :host([overflow="hidden"]) { overflow: hidden; }
		  :host([overflow="auto"])   { overflow: auto; }
		  :host([stiff])   { flex-grow: 0; flex-shrink: 0; }
        `}static get properties(){return{alignSelf:{type:String,reflect:!0},background:{type:String,reflect:!0},overflow:{type:String,reflect:!0},radius:{type:String,reflect:!0},borderColor:{type:String,reflect:!0},borderWidth:{type:String,reflect:!0},display:{type:String,reflect:!0},elevation:{type:String,reflect:!0},flex:{type:String,reflect:!0},grow:{type:String,reflect:!0},height:{type:String,reflect:!0},order:{type:String,reflect:!0},maxWidth:{type:String,reflect:!0},ring:{type:String,reflect:!0},shrink:{type:String,reflect:!0},width:{type:String,reflect:!0},margin:{type:String,reflect:!0},marginBlock:{type:String,reflect:!0},marginTop:{type:String,reflect:!0},marginBottom:{type:String,reflect:!0},marginInline:{type:String,reflect:!0},marginStart:{type:String,reflect:!0},marginEnd:{type:String,reflect:!0},padding:{type:String,reflect:!0},paddingTop:{type:String,reflect:!0},paddingBottom:{type:String,reflect:!0},paddingStart:{type:String,reflect:!0},paddingEnd:{type:String,reflect:!0}}}safeGetPropertyValue(t,i){return t&&i[t]?i[t]:t&&[...i.keys()].includes(t)?t:""}getSafeStyle(){const t=[];t.grow="auto",t.shrink="0 auto",t.stiff="none",t.flexible="1";const i=[0,1,2,3,4,5,6],e=[];e.auto="auto",e.start="flex-start",e.end="flex-end",e.center="center",e.baseline="baseline",e.stretch="stretch";const s=this.safeGetPropertyValue(this.flex,t),o=this.safeGetPropertyValue(this.grow,i),n=this.safeGetPropertyValue(this.order,[0,1,2,3,4,5,6,7,8,9]),r=this.safeGetPropertyValue(this.shrink,i),l=this.safeGetPropertyValue(this.alignSelf,e),h=!(!this.radius||!["none","xxs","xs","s","m","l","xl","xxl","round-100","round-200","round-300","round-400","round-600"].includes(this.radius))&&this.radius,c=h&&"var(--ewc-size-radius-"+h+")";return ct`
			:host {
				--ewc-flex-flex: ${ht(s||"-")};
				--ewc-flex-grow: ${ht(o||"-")};
				--ewc-flex-order: ${ht(n||"-")};
				--ewc-flex-shrink: ${ht(r||"-")};
				--ewc-flex-align-self: ${ht(l||"inherit")};
			}
			:host { --ewc-box-radius: ${ht(c||"0")}; }`}getStyleTag(){return Wt`<style>
			:host {
				display:  	${this.display?this.display:"block"};
				width:    	var(--ewc-box-width,        var(--ewc-width-${this.width}));
				max-width:	var(--ewc-box-max-width,    var(--ewc-width-${this.maxWidth}));
				height:   	var(--ewc-box-height,       var(--ewc-height-${this.height}, var(--ewc-size-${this.height}, auto)));

				margin:               var(--ewc-box-margin,           var(--ewc-size-${this.margin}));
				padding:              var(--ewc-box-padding,          var(--ewc-size-${this.padding}));

				margin-inline:	      var(--ewc-box-margin-inline,     var(--ewc-size-${this.marginInline}));

				margin-top:           var(--ewc-box-margin-top,       var(--ewc-size-${this.marginTop}));
				margin-bottom:        var(--ewc-box-margin-bottom,    var(--ewc-size-${this.marginBottom}));
				margin-inline-start:  var(--ewc-box-margin-start,     var(--ewc-size-${this.marginStart}, var(--ewc-size-${this.marginInline})));
				margin-inline-end:    var(--ewc-box-margin-end,       var(--ewc-size-${this.marginEnd}, var(--ewc-size-${this.marginInline})));

				padding-top:          var(--ewc-box-padding-top,      var(--ewc-size-${this.paddingTop},    var(--ewc-size-${this.padding})));
				padding-bottom:       var(--ewc-box-padding-bottom,   var(--ewc-size-${this.paddingBottom}, var(--ewc-size-${this.padding})));
				padding-inline-start: var(--ewc-box-padding-start,    var(--ewc-size-${this.paddingStart},  var(--ewc-size-${this.padding})));
				padding-inline-end:   var(--ewc-box-padding-end,      var(--ewc-size-${this.paddingEnd},    var(--ewc-size-${this.padding})));

				background: var(--ewc-box-background,   var(--ewc-color-${this.background}));

				border: var(--ewc-box-border-width, var(--ewc-size-border-${this.borderWidth}, ${this.borderWidth?"1px":"0"}))
						var(--ewc-box-border-style, solid)
						var(--ewc-box-border-color, var(--ewc-color-${this.borderColor}, transparent));
			}

			${this.getSafeStyle()}
		</style>`}constructor(){super(),this.flex=null,this.grow=null,this.shrink=null,this.alignSelf=null,this.order=null,this.radius=null,this.padding=null}render(){return Wt`
			${this.getStyleTag()}
			<slot></slot>`}}window.customElements.define("e-box",hi);class ci extends hi{static get styles(){return[super.styles,ct`
		  	:host { display: flex; }
            :host([direction="row"])            { flex-direction: row }
            :host([direction="row-reverse"])    { flex-direction: row-reverse }
            :host([direction="column"])         { flex-direction: column }
            :host([direction="column-reverse"]) { flex-direction: column-reverse }

            :host([wrap])            	{ flex-wrap: wrap }
            :host([wrap="reverse"])     { flex-wrap: wrap-reverse }

            :host([justifyContent="start"])    { justify-content: flex-start }
            :host([justifyContent="end"])      { justify-content: flex-end }
            :host([justifyContent="center"])   { justify-content: center }
            :host([justifyContent="between"])  { justify-content: space-between }
            :host([justifyContent="around"])   { justify-content: space-around }
            :host([justifyContent="evenly"])   { justify-content: space-evenly }

            :host([alignItems="start"])      { align-items: flex-start }
            :host([alignItems="end"])        { align-items: flex-end }
            :host([alignItems="center"])     { align-items: center }
            :host([alignItems="baseline"])   { align-items: baseline }
            :host([alignItems="stretch"])    { align-items: stretch }

            :host([alignContent="start"])    { align-content: flex-start }
            :host([alignContent="end"])      { align-content: flex-end }
            :host([alignContent="center"])   { align-content: center }
            :host([alignContent="between"])  { align-content: space-between }
            :host([alignContent="around"])   { align-content: space-around }
            :host([alignContent="around"])   { align-content: space-evenly }
            :host([alignContent="stretch"])  { align-content: stretch }

            // Item
            .flex-flex-grow        { flex: auto }
            .flex-flex-shrink      { flex: 0 auto }
            .flex-flex-inflexible  { flex: none }
            .flex-flex-flexible    { flex: 1 }

            .flex-1       		{ flex: 1 }
            .flex-auto    		{ flex: auto }
            .flex-grow-0  		{ flex-grow: 0 }
            .flex-shrink-0		{ flex-shrink: 0 }

            .flex-self-auto     { align-self: auto }
            .flex-self-start    { align-self: flex-start }
            .flex-self-end      { align-self: flex-end }
            .flex-self-center   { align-self: center }
            .flex-self-baseline { align-self: baseline }
            .flex-self-stretch  { align-self: stretch }

            .flex-order-0		{ order: 0 }
            .flex-order-1		{ order: 10 }
            .flex-order-2		{ order: 20 }
            .flex-order-3		{ order: 30 }
            .flex-order-4		{ order: 40 }
            .flex-order-5		{ order: 50 }
            .flex-order-6		{ order: 60 }
            .flex-order-7		{ order: 70 }
            .flex-order-8		{ order: 80 }
            .flex-order-9		{ order: 90 }
            .flex-order-10		{ order: 100 }
            .flex-order-none	{ order: inherit }
        `]}static get properties(){return{alignItems:{type:String,reflect:!0},alignContent:{type:String,reflect:!0},direction:{type:String,reflect:!0},flex:{type:String,reflect:!0},fullWidth:{type:Boolean,reflect:!0},gap:{type:String,reflect:!0},grow:{type:String,reflect:!0},justifyContent:{type:String,reflect:!0},shrink:{type:String,reflect:!0},wrap:{type:Boolean,reflect:!0},wrapReverse:{type:Boolean,reflect:!0}}}getFlexStyles(){return Wt`
			<style>
				:host {
					gap: var(--ewc-flex-gap, var(--ewc-size-${this.gap}));
				}
			</style>`}constructor(){super(),this.direction=null,this.flex=null,this.gap=null,this.justifyContent=null,this.alignContent=null,this.alignItems=null,this.wrap=null,this.grow=null,this.shrink=null,this.alignSelf=null}render(){return Wt`
		  ${this.getStyleTag()}
		  ${this.getFlexStyles()}
		  <slot></slot>`}}window.customElements.define("e-flex",ci);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ai=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,di=Symbol();class ui{constructor(t,i){if(i!==di)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return ai&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const vi=new Map,fi=t=>{let i=vi.get(t);return void 0===i&&vi.set(t,i=new ui(t,di)),i},pi=(t,...i)=>{const e=1===t.length?t[0]:i.reduce(((i,e,s)=>i+(t=>{if(t instanceof ui)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(e)+t[s+1]),t[0]);return fi(e)},wi=ai?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const e of t.cssRules)i+=e.cssText;return(t=>fi("string"==typeof t?t:t+""))(i)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var gi,bi,yi,mi;const xi={toAttribute(t,i){switch(i){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let e=t;switch(i){case Boolean:e=null!==t;break;case Number:e=null===t?null:Number(t);break;case Object:case Array:try{e=JSON.parse(t)}catch(t){e=null}}return e}},Si=(t,i)=>i!==t&&(i==i||t==t),zi={attribute:!0,type:String,converter:xi,reflect:!1,hasChanged:Si};class $i extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var i;null!==(i=this.v)&&void 0!==i||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,e)=>{const s=this.Πp(e,i);void 0!==s&&(this.Πm.set(s,e),t.push(s))})),t}static createProperty(t,i=zi){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const e="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,e,i);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,i,e){return{get(){return this[i]},set(s){const o=this[t];this[i]=s,this.requestUpdate(t,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||zi}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const e of i)this.createProperty(e,t[e])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const e=new Set(t.flat(1/0).reverse());for(const t of e)i.unshift(wi(t))}else void 0!==t&&i.push(wi(t));return i}static Πp(t,i){const e=i.attribute;return!1===e?void 0:"string"==typeof e?e:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,e;(null!==(i=this.ΠU)&&void 0!==i?i:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(e=t.hostConnected)||void 0===e||e.call(t))}removeController(t){var i;null===(i=this.ΠU)||void 0===i||i.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this.Πi.set(i,this[i]),delete this[i])}))}createRenderRoot(){var t;const i=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{ai?t.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):i.forEach((i=>{const e=document.createElement("style");e.textContent=i.cssText,t.appendChild(e)}))})(i,this.constructor.elementStyles),i}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,i,e){this.K(t,e)}Πj(t,i,e=zi){var s,o;const n=this.constructor.Πp(t,e);if(void 0!==n&&!0===e.reflect){const r=(null!==(o=null===(s=e.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==o?o:xi.toAttribute)(i,e.type);this.Πh=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this.Πh=null}}K(t,i){var e,s,o;const n=this.constructor,r=n.Πm.get(t);if(void 0!==r&&this.Πh!==r){const t=n.getPropertyOptions(r),l=t.converter,h=null!==(o=null!==(s=null===(e=l)||void 0===e?void 0:e.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==o?o:xi.fromAttribute;this.Πh=r,this[r]=h(i,t.type),this.Πh=null}}requestUpdate(t,i,e){let s=!0;void 0!==t&&(((e=e||this.constructor.getPropertyOptions(t)).hasChanged||Si)(this[t],i)?(this.L.has(t)||this.L.set(t,i),!0===e.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,e))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,i)=>this[i]=t)),this.Πi=void 0);let i=!1;const e=this.L;try{i=this.shouldUpdate(e),i?(this.willUpdate(e),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(e)):this.Π$()}catch(t){throw i=!1,this.Π$(),t}i&&this.E(e)}willUpdate(t){}E(t){var i;null===(i=this.ΠU)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,i)=>this.Πj(i,this[i],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Ci,ki,Ti,_i;$i.finalized=!0,$i.elementProperties=new Map,$i.elementStyles=[],$i.shadowRootOptions={mode:"open"},null===(bi=(gi=globalThis).reactiveElementPlatformSupport)||void 0===bi||bi.call(gi,{ReactiveElement:$i}),(null!==(yi=(mi=globalThis).reactiveElementVersions)&&void 0!==yi?yi:mi.reactiveElementVersions=[]).push("1.0.0-rc.2");const Mi=globalThis.trustedTypes,ji=Mi?Mi.createPolicy("lit-html",{createHTML:t=>t}):void 0,Ei=`lit$${(Math.random()+"").slice(9)}$`,Ai="?"+Ei,Oi=`<${Ai}>`,Ii=document,Ui=(t="")=>Ii.createComment(t),Pi=t=>null===t||"object"!=typeof t&&"function"!=typeof t,Ni=Array.isArray,Ri=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Wi=/-->/g,Li=/>/g,Bi=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,qi=/'/g,Vi=/"/g,Fi=/^(?:script|style|textarea)$/i,Hi=Symbol.for("lit-noChange"),Ji=Symbol.for("lit-nothing"),Di=new WeakMap,Zi=Ii.createTreeWalker(Ii,129,null,!1);class Gi{constructor({strings:t,_$litType$:i},e){let s;this.parts=[];let o=0,n=0;const r=t.length-1,l=this.parts,[h,c]=((t,i)=>{const e=t.length-1,s=[];let o,n=2===i?"<svg>":"",r=Ri;for(let i=0;i<e;i++){const e=t[i];let l,h,c=-1,a=0;for(;a<e.length&&(r.lastIndex=a,h=r.exec(e),null!==h);)a=r.lastIndex,r===Ri?"!--"===h[1]?r=Wi:void 0!==h[1]?r=Li:void 0!==h[2]?(Fi.test(h[2])&&(o=RegExp("</"+h[2],"g")),r=Bi):void 0!==h[3]&&(r=Bi):r===Bi?">"===h[0]?(r=null!=o?o:Ri,c=-1):void 0===h[1]?c=-2:(c=r.lastIndex-h[2].length,l=h[1],r=void 0===h[3]?Bi:'"'===h[3]?Vi:qi):r===Vi||r===qi?r=Bi:r===Wi||r===Li?r=Ri:(r=Bi,o=void 0);const d=r===Bi&&t[i+1].startsWith("/>")?" ":"";n+=r===Ri?e+Oi:c>=0?(s.push(l),e.slice(0,c)+"$lit$"+e.slice(c)+Ei+d):e+Ei+(-2===c?(s.push(void 0),i):d)}const l=n+(t[e]||"<?>")+(2===i?"</svg>":"");return[void 0!==ji?ji.createHTML(l):l,s]})(t,i);if(this.el=Gi.createElement(h,e),Zi.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(s=Zi.nextNode())&&l.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const i of s.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(Ei)){const e=c[n++];if(t.push(i),void 0!==e){const t=s.getAttribute(e.toLowerCase()+"$lit$").split(Ei),i=/([.?@])?(.*)/.exec(e);l.push({type:1,index:o,name:i[2],strings:t,ctor:"."===i[1]?te:"?"===i[1]?ie:"@"===i[1]?ee:Yi})}else l.push({type:6,index:o})}for(const i of t)s.removeAttribute(i)}if(Fi.test(s.tagName)){const t=s.textContent.split(Ei),i=t.length-1;if(i>0){s.textContent=Mi?Mi.emptyScript:"";for(let e=0;e<i;e++)s.append(t[e],Ui()),Zi.nextNode(),l.push({type:2,index:++o});s.append(t[i],Ui())}}}else if(8===s.nodeType)if(s.data===Ai)l.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(Ei,t+1));)l.push({type:7,index:o}),t+=Ei.length-1}o++}}static createElement(t,i){const e=Ii.createElement("template");return e.innerHTML=t,e}}function Ki(t,i,e=t,s){var o,n,r,l;if(i===Hi)return i;let h=void 0!==s?null===(o=e.Σi)||void 0===o?void 0:o[s]:e.Σo;const c=Pi(i)?void 0:i._$litDirective$;return(null==h?void 0:h.constructor)!==c&&(null===(n=null==h?void 0:h.O)||void 0===n||n.call(h,!1),void 0===c?h=void 0:(h=new c(t),h.T(t,e,s)),void 0!==s?(null!==(r=(l=e).Σi)&&void 0!==r?r:l.Σi=[])[s]=h:e.Σo=h),void 0!==h&&(i=Ki(t,h.S(t,i.values),h,s)),i}class Qi{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:e},parts:s}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:Ii).importNode(e,!0);Zi.currentNode=o;let n=Zi.nextNode(),r=0,l=0,h=s[0];for(;void 0!==h;){if(r===h.index){let i;2===h.type?i=new Xi(n,n.nextSibling,this,t):1===h.type?i=new h.ctor(n,h.name,h.strings,this,t):6===h.type&&(i=new se(n,this,t)),this.l.push(i),h=s[++l]}r!==(null==h?void 0:h.index)&&(n=Zi.nextNode(),r++)}return o}v(t){let i=0;for(const e of this.l)void 0!==e&&(void 0!==e.strings?(e.I(t,e,i),i+=e.strings.length-2):e.I(t[i])),i++}}class Xi{constructor(t,i,e,s){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=e,this.options=s}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=Ki(this,t,i),Pi(t)?t===Ji||null==t||""===t?(this.H!==Ji&&this.R(),this.H=Ji):t!==this.H&&t!==Hi&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return Ni(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(Ii.createTextNode(t)),this.H=t}_(t){var i;const{values:e,_$litType$:s}=t,o="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=Gi.createElement(s.h,this.options)),s);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(e);else{const t=new Qi(o,this),i=t.u(this.options);t.v(e),this.$(i),this.H=t}}C(t){let i=Di.get(t.strings);return void 0===i&&Di.set(t.strings,i=new Gi(t)),i}g(t){Ni(this.H)||(this.H=[],this.R());const i=this.H;let e,s=0;for(const o of t)s===i.length?i.push(e=new Xi(this.k(Ui()),this.k(Ui()),this,this.options)):e=i[s],e.I(o),s++;s<i.length&&(this.R(e&&e.B.nextSibling,s),i.length=s)}R(t=this.A.nextSibling,i){var e;for(null===(e=this.P)||void 0===e||e.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class Yi{constructor(t,i,e,s,o){this.type=1,this.H=Ji,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=s,this.options=o,e.length>2||""!==e[0]||""!==e[1]?(this.H=Array(e.length-1).fill(Ji),this.strings=e):this.H=Ji}get tagName(){return this.element.tagName}I(t,i=this,e,s){const o=this.strings;let n=!1;if(void 0===o)t=Ki(this,t,i,0),n=!Pi(t)||t!==this.H&&t!==Hi,n&&(this.H=t);else{const s=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=Ki(this,s[e+r],i,r),l===Hi&&(l=this.H[r]),n||(n=!Pi(l)||l!==this.H[r]),l===Ji?t=Ji:t!==Ji&&(t+=(null!=l?l:"")+o[r+1]),this.H[r]=l}n&&!s&&this.W(t)}W(t){t===Ji?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class te extends Yi{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===Ji?void 0:t}}class ie extends Yi{constructor(){super(...arguments),this.type=4}W(t){t&&t!==Ji?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class ee extends Yi{constructor(){super(...arguments),this.type=5}I(t,i=this){var e;if((t=null!==(e=Ki(this,t,i,0))&&void 0!==e?e:Ji)===Hi)return;const s=this.H,o=t===Ji&&s!==Ji||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==Ji&&(s===Ji||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,e;"function"==typeof this.H?this.H.call(null!==(e=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==e?e:this.element,t):this.H.handleEvent(t)}}class se{constructor(t,i,e){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=e}I(t){Ki(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var oe,ne,re,le;null===(ki=(Ci=globalThis).litHtmlPlatformSupport)||void 0===ki||ki.call(Ci,Gi,Xi),(null!==(Ti=(_i=globalThis).litHtmlVersions)&&void 0!==Ti?Ti:_i.litHtmlVersions=[]).push("2.0.0-rc.3");const he=globalThis.trustedTypes,ce=he?he.createPolicy("lit-html",{createHTML:t=>t}):void 0,ae=`lit$${(Math.random()+"").slice(9)}$`,de="?"+ae,ue=`<${de}>`,ve=document,fe=(t="")=>ve.createComment(t),pe=t=>null===t||"object"!=typeof t&&"function"!=typeof t,we=Array.isArray,ge=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,be=/-->/g,ye=/>/g,me=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,xe=/'/g,Se=/"/g,ze=/^(?:script|style|textarea)$/i,$e=Symbol.for("lit-noChange"),Ce=Symbol.for("lit-nothing"),ke=new WeakMap,Te=ve.createTreeWalker(ve,129,null,!1),_e=(t,i)=>{const e=t.length-1,s=[];let o,n=2===i?"<svg>":"",r=ge;for(let i=0;i<e;i++){const e=t[i];let l,h,c=-1,a=0;for(;a<e.length&&(r.lastIndex=a,h=r.exec(e),null!==h);)a=r.lastIndex,r===ge?"!--"===h[1]?r=be:void 0!==h[1]?r=ye:void 0!==h[2]?(ze.test(h[2])&&(o=RegExp("</"+h[2],"g")),r=me):void 0!==h[3]&&(r=me):r===me?">"===h[0]?(r=null!=o?o:ge,c=-1):void 0===h[1]?c=-2:(c=r.lastIndex-h[2].length,l=h[1],r=void 0===h[3]?me:'"'===h[3]?Se:xe):r===Se||r===xe?r=me:r===be||r===ye?r=ge:(r=me,o=void 0);const d=r===me&&t[i+1].startsWith("/>")?" ":"";n+=r===ge?e+ue:c>=0?(s.push(l),e.slice(0,c)+"$lit$"+e.slice(c)+ae+d):e+ae+(-2===c?(s.push(void 0),i):d)}const l=n+(t[e]||"<?>")+(2===i?"</svg>":"");return[void 0!==ce?ce.createHTML(l):l,s]};class Me{constructor({strings:t,_$litType$:i},e){let s;this.parts=[];let o=0,n=0;const r=t.length-1,l=this.parts,[h,c]=_e(t,i);if(this.el=Me.createElement(h,e),Te.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(s=Te.nextNode())&&l.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const i of s.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(ae)){const e=c[n++];if(t.push(i),void 0!==e){const t=s.getAttribute(e.toLowerCase()+"$lit$").split(ae),i=/([.?@])?(.*)/.exec(e);l.push({type:1,index:o,name:i[2],strings:t,ctor:"."===i[1]?Ie:"?"===i[1]?Ue:"@"===i[1]?Pe:Oe})}else l.push({type:6,index:o})}for(const i of t)s.removeAttribute(i)}if(ze.test(s.tagName)){const t=s.textContent.split(ae),i=t.length-1;if(i>0){s.textContent=he?he.emptyScript:"";for(let e=0;e<i;e++)s.append(t[e],fe()),Te.nextNode(),l.push({type:2,index:++o});s.append(t[i],fe())}}}else if(8===s.nodeType)if(s.data===de)l.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(ae,t+1));)l.push({type:7,index:o}),t+=ae.length-1}o++}}static createElement(t,i){const e=ve.createElement("template");return e.innerHTML=t,e}}function je(t,i,e=t,s){var o,n,r,l;if(i===$e)return i;let h=void 0!==s?null===(o=e.Σi)||void 0===o?void 0:o[s]:e.Σo;const c=pe(i)?void 0:i._$litDirective$;return(null==h?void 0:h.constructor)!==c&&(null===(n=null==h?void 0:h.O)||void 0===n||n.call(h,!1),void 0===c?h=void 0:(h=new c(t),h.T(t,e,s)),void 0!==s?(null!==(r=(l=e).Σi)&&void 0!==r?r:l.Σi=[])[s]=h:e.Σo=h),void 0!==h&&(i=je(t,h.S(t,i.values),h,s)),i}class Ee{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:e},parts:s}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:ve).importNode(e,!0);Te.currentNode=o;let n=Te.nextNode(),r=0,l=0,h=s[0];for(;void 0!==h;){if(r===h.index){let i;2===h.type?i=new Ae(n,n.nextSibling,this,t):1===h.type?i=new h.ctor(n,h.name,h.strings,this,t):6===h.type&&(i=new Ne(n,this,t)),this.l.push(i),h=s[++l]}r!==(null==h?void 0:h.index)&&(n=Te.nextNode(),r++)}return o}v(t){let i=0;for(const e of this.l)void 0!==e&&(void 0!==e.strings?(e.I(t,e,i),i+=e.strings.length-2):e.I(t[i])),i++}}class Ae{constructor(t,i,e,s){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=e,this.options=s}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=je(this,t,i),pe(t)?t===Ce||null==t||""===t?(this.H!==Ce&&this.R(),this.H=Ce):t!==this.H&&t!==$e&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return we(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(ve.createTextNode(t)),this.H=t}_(t){var i;const{values:e,_$litType$:s}=t,o="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=Me.createElement(s.h,this.options)),s);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(e);else{const t=new Ee(o,this),i=t.u(this.options);t.v(e),this.$(i),this.H=t}}C(t){let i=ke.get(t.strings);return void 0===i&&ke.set(t.strings,i=new Me(t)),i}g(t){we(this.H)||(this.H=[],this.R());const i=this.H;let e,s=0;for(const o of t)s===i.length?i.push(e=new Ae(this.k(fe()),this.k(fe()),this,this.options)):e=i[s],e.I(o),s++;s<i.length&&(this.R(e&&e.B.nextSibling,s),i.length=s)}R(t=this.A.nextSibling,i){var e;for(null===(e=this.P)||void 0===e||e.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class Oe{constructor(t,i,e,s,o){this.type=1,this.H=Ce,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=s,this.options=o,e.length>2||""!==e[0]||""!==e[1]?(this.H=Array(e.length-1).fill(Ce),this.strings=e):this.H=Ce}get tagName(){return this.element.tagName}I(t,i=this,e,s){const o=this.strings;let n=!1;if(void 0===o)t=je(this,t,i,0),n=!pe(t)||t!==this.H&&t!==$e,n&&(this.H=t);else{const s=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=je(this,s[e+r],i,r),l===$e&&(l=this.H[r]),n||(n=!pe(l)||l!==this.H[r]),l===Ce?t=Ce:t!==Ce&&(t+=(null!=l?l:"")+o[r+1]),this.H[r]=l}n&&!s&&this.W(t)}W(t){t===Ce?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Ie extends Oe{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===Ce?void 0:t}}class Ue extends Oe{constructor(){super(...arguments),this.type=4}W(t){t&&t!==Ce?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class Pe extends Oe{constructor(){super(...arguments),this.type=5}I(t,i=this){var e;if((t=null!==(e=je(this,t,i,0))&&void 0!==e?e:Ce)===$e)return;const s=this.H,o=t===Ce&&s!==Ce||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==Ce&&(s===Ce||o);o&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,e;"function"==typeof this.H?this.H.call(null!==(e=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==e?e:this.element,t):this.H.handleEvent(t)}}class Ne{constructor(t,i,e){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=e}I(t){je(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Re,We,Le,Be,qe,Ve;null===(ne=(oe=globalThis).litHtmlPlatformSupport)||void 0===ne||ne.call(oe,Me,Ae),(null!==(re=(le=globalThis).litHtmlVersions)&&void 0!==re?re:le.litHtmlVersions=[]).push("2.0.0-rc.3"),(null!==(Re=(Ve=globalThis).litElementVersions)&&void 0!==Re?Re:Ve.litElementVersions=[]).push("3.0.0-rc.2");class Fe extends $i{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,i;const e=super.createRenderRoot();return null!==(t=(i=this.renderOptions).renderBefore)&&void 0!==t||(i.renderBefore=e.firstChild),e}update(t){const i=this.render();super.update(t),this.Φt=((t,i,e)=>{var s,o;const n=null!==(s=null==e?void 0:e.renderBefore)&&void 0!==s?s:i;let r=n._$litPart$;if(void 0===r){const t=null!==(o=null==e?void 0:e.renderBefore)&&void 0!==o?o:null;n._$litPart$=r=new Ae(i.insertBefore(fe(),t),t,void 0,e)}return r.I(t),r})(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return $e}}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function He(t,i,e,s){for(var o,n=arguments.length,r=n<3?i:null===s?s=Object.getOwnPropertyDescriptor(i,e):s,l=t.length-1;l>=0;l--)(o=t[l])&&(r=(n<3?o(r):n>3?o(i,e,r):o(i,e))||r);return n>3&&r&&Object.defineProperty(i,e,r),r
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */}Fe.finalized=!0,Fe._$litElement$=!0,null===(Le=(We=globalThis).litElementHydrateSupport)||void 0===Le||Le.call(We,{LitElement:Fe}),null===(qe=(Be=globalThis).litElementPlatformSupport)||void 0===qe||qe.call(Be,{LitElement:Fe});const Je="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,De=(t,i,e=null)=>{for(;i!==e;){const e=i.nextSibling;t.removeChild(i),i=e}},Ze=`{{lit-${String(Math.random()).slice(2)}}}`,Ge=`\x3c!--${Ze}--\x3e`,Ke=new RegExp(`${Ze}|${Ge}`);class Qe{constructor(t,i){this.parts=[],this.element=i;const e=[],s=[],o=document.createTreeWalker(i.content,133,null,!1);let n=0,r=-1,l=0;const{strings:h,values:{length:c}}=t;for(;l<c;){const t=o.nextNode();if(null!==t){if(r++,1===t.nodeType){if(t.hasAttributes()){const i=t.attributes,{length:e}=i;let s=0;for(let t=0;t<e;t++)Xe(i[t].name,"$lit$")&&s++;for(;s-- >0;){const i=h[l],e=is.exec(i)[2],s=e.toLowerCase()+"$lit$",o=t.getAttribute(s);t.removeAttribute(s);const n=o.split(Ke);this.parts.push({type:"attribute",index:r,name:e,strings:n}),l+=n.length-1}}"TEMPLATE"===t.tagName&&(s.push(t),o.currentNode=t.content)}else if(3===t.nodeType){const i=t.data;if(i.indexOf(Ze)>=0){const s=t.parentNode,o=i.split(Ke),n=o.length-1;for(let i=0;i<n;i++){let e,n=o[i];if(""===n)e=ts();else{const t=is.exec(n);null!==t&&Xe(t[2],"$lit$")&&(n=n.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),e=document.createTextNode(n)}s.insertBefore(e,t),this.parts.push({type:"node",index:++r})}""===o[n]?(s.insertBefore(ts(),t),e.push(t)):t.data=o[n],l+=n}}else if(8===t.nodeType)if(t.data===Ze){const i=t.parentNode;null!==t.previousSibling&&r!==n||(r++,i.insertBefore(ts(),t)),n=r,this.parts.push({type:"node",index:r}),null===t.nextSibling?t.data="":(e.push(t),r--),l++}else{let i=-1;for(;-1!==(i=t.data.indexOf(Ze,i+1));)this.parts.push({type:"node",index:-1}),l++}}else o.currentNode=s.pop()}for(const t of e)t.parentNode.removeChild(t)}}const Xe=(t,i)=>{const e=t.length-i.length;return e>=0&&t.slice(e)===i},Ye=t=>-1!==t.index,ts=()=>document.createComment(""),is=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function es(t,i){const{element:{content:e},parts:s}=t,o=document.createTreeWalker(e,133,null,!1);let n=os(s),r=s[n],l=-1,h=0;const c=[];let a=null;for(;o.nextNode();){l++;const t=o.currentNode;for(t.previousSibling===a&&(a=null),i.has(t)&&(c.push(t),null===a&&(a=t)),null!==a&&h++;void 0!==r&&r.index===l;)r.index=null!==a?-1:r.index-h,n=os(s,n),r=s[n]}c.forEach((t=>t.parentNode.removeChild(t)))}const ss=t=>{let i=11===t.nodeType?0:1;const e=document.createTreeWalker(t,133,null,!1);for(;e.nextNode();)i++;return i},os=(t,i=-1)=>{for(let e=i+1;e<t.length;e++){const i=t[e];if(Ye(i))return e}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const ns=new WeakMap,rs=t=>"function"==typeof t&&ns.has(t),ls={},hs={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class cs{constructor(t,i,e){this.i=[],this.template=t,this.processor=i,this.options=e}update(t){let i=0;for(const e of this.i)void 0!==e&&e.setValue(t[i]),i++;for(const t of this.i)void 0!==t&&t.commit()}_clone(){const t=Je?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),i=[],e=this.template.parts,s=document.createTreeWalker(t,133,null,!1);let o,n=0,r=0,l=s.nextNode();for(;n<e.length;)if(o=e[n],Ye(o)){for(;r<o.index;)r++,"TEMPLATE"===l.nodeName&&(i.push(l),s.currentNode=l.content),null===(l=s.nextNode())&&(s.currentNode=i.pop(),l=s.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(l.previousSibling),this.i.push(t)}else this.i.push(...this.processor.handleAttributeExpressions(l,o.name,o.strings,this.options));n++}else this.i.push(void 0),n++;return Je&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const as=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t}),ds=` ${Ze} `;class us{constructor(t,i,e,s){this.strings=t,this.values=i,this.type=e,this.processor=s}getHTML(){const t=this.strings.length-1;let i="",e=!1;for(let s=0;s<t;s++){const t=this.strings[s],o=t.lastIndexOf("\x3c!--");e=(o>-1||e)&&-1===t.indexOf("--\x3e",o+1);const n=is.exec(t);i+=null===n?t+(e?ds:Ge):t.substr(0,n.index)+n[1]+n[2]+"$lit$"+n[3]+Ze}return i+=this.strings[t],i}getTemplateElement(){const t=document.createElement("template");let i=this.getHTML();return void 0!==as&&(i=as.createHTML(i)),t.innerHTML=i,t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const vs=t=>null===t||!("object"==typeof t||"function"==typeof t),fs=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class ps{constructor(t,i,e){this.dirty=!0,this.element=t,this.name=i,this.strings=e,this.parts=[];for(let t=0;t<e.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new ws(this)}_getValue(){const t=this.strings,i=t.length-1,e=this.parts;if(1===i&&""===t[0]&&""===t[1]){const t=e[0].value;if("symbol"==typeof t)return String(t);if("string"==typeof t||!fs(t))return t}let s="";for(let o=0;o<i;o++){s+=t[o];const i=e[o];if(void 0!==i){const t=i.value;if(vs(t)||!fs(t))s+="string"==typeof t?t:String(t);else for(const i of t)s+="string"==typeof i?i:String(i)}}return s+=t[i],s}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class ws{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===ls||vs(t)&&t===this.value||(this.value=t,rs(t)||(this.committer.dirty=!0))}commit(){for(;rs(this.value);){const t=this.value;this.value=ls,t(this)}this.value!==ls&&this.committer.commit()}}class gs{constructor(t){this.value=void 0,this.o=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(ts()),this.endNode=t.appendChild(ts())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.p(this.startNode=ts()),t.p(this.endNode=ts())}insertAfterPart(t){t.p(this.startNode=ts()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.o=t}commit(){if(null===this.startNode.parentNode)return;for(;rs(this.o);){const t=this.o;this.o=ls,t(this)}const t=this.o;t!==ls&&(vs(t)?t!==this.value&&this.j(t):t instanceof us?this.U(t):t instanceof Node?this.q(t):fs(t)?this.F(t):t===hs?(this.value=hs,this.clear()):this.j(t))}p(t){this.endNode.parentNode.insertBefore(t,this.endNode)}q(t){this.value!==t&&(this.clear(),this.p(t),this.value=t)}j(t){const i=this.startNode.nextSibling,e="string"==typeof(t=t??"")?t:String(t);i===this.endNode.previousSibling&&3===i.nodeType?i.data=e:this.q(document.createTextNode(e)),this.value=t}U(t){const i=this.options.templateFactory(t);if(this.value instanceof cs&&this.value.template===i)this.value.update(t.values);else{const e=new cs(i,t.processor,this.options),s=e._clone();e.update(t.values),this.q(s),this.value=e}}F(t){Array.isArray(this.value)||(this.value=[],this.clear());const i=this.value;let e,s=0;for(const o of t)e=i[s],void 0===e&&(e=new gs(this.options),i.push(e),0===s?e.appendIntoPart(this):e.insertAfterPart(i[s-1])),e.setValue(o),e.commit(),s++;s<i.length&&(i.length=s,this.clear(e&&e.endNode))}clear(t=this.startNode){De(this.startNode.parentNode,t.nextSibling,this.endNode)}}class bs{constructor(t,i,e){if(this.value=void 0,this.o=void 0,2!==e.length||""!==e[0]||""!==e[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=i,this.strings=e}setValue(t){this.o=t}commit(){for(;rs(this.o);){const t=this.o;this.o=ls,t(this)}if(this.o===ls)return;const t=!!this.o;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.o=ls}}class ys extends ps{constructor(t,i,e){super(t,i,e),this.single=2===e.length&&""===e[0]&&""===e[1]}_createPart(){return new ms(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class ms extends ws{}let xs=!1;(()=>{try{const t={get capture(){return xs=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class Ss{constructor(t,i,e){this.value=void 0,this.o=void 0,this.element=t,this.eventName=i,this.eventContext=e,this.J=t=>this.handleEvent(t)}setValue(t){this.o=t}commit(){for(;rs(this.o);){const t=this.o;this.o=ls,t(this)}if(this.o===ls)return;const t=this.o,i=this.value,e=null==t||null!=i&&(t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive),s=null!=t&&(null==i||e);e&&this.element.removeEventListener(this.eventName,this.J,this.Z),s&&(this.Z=zs(t),this.element.addEventListener(this.eventName,this.J,this.Z)),this.value=t,this.o=ls}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const zs=t=>t&&(xs?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function $s(t){let i=Cs.get(t.type);void 0===i&&(i={stringsArray:new WeakMap,keyString:new Map},Cs.set(t.type,i));let e=i.stringsArray.get(t.strings);if(void 0!==e)return e;const s=t.strings.join(Ze);return e=i.keyString.get(s),void 0===e&&(e=new Qe(t,t.getTemplateElement()),i.keyString.set(s,e)),i.stringsArray.set(t.strings,e),e}const Cs=new Map,ks=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Ts=new
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class{handleAttributeExpressions(t,i,e,s){const o=i[0];if("."===o){return new ys(t,i.slice(1),e).parts}if("@"===o)return[new Ss(t,i.slice(1),s.eventContext)];if("?"===o)return[new bs(t,i.slice(1),e)];return new ps(t,i,e).parts}handleTextExpression(t){return new gs(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const _s=(t,...i)=>new us(t,i,"html",Ts)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */,Ms=(t,i)=>`${t}--${i}`;let js=!0;void 0===window.ShadyCSS?js=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),js=!1);const Es=t=>i=>{const e=Ms(i.type,t);let s=Cs.get(e);void 0===s&&(s={stringsArray:new WeakMap,keyString:new Map},Cs.set(e,s));let o=s.stringsArray.get(i.strings);if(void 0!==o)return o;const n=i.strings.join(Ze);if(o=s.keyString.get(n),void 0===o){const e=i.getTemplateElement();js&&window.ShadyCSS.prepareTemplateDom(e,t),o=new Qe(i,e),s.keyString.set(n,o)}return s.stringsArray.set(i.strings,o),o},As=["html","svg"],Os=new Set,Is=(t,i,e)=>{Os.add(t);const s=e?e.element:document.createElement("template"),o=i.querySelectorAll("style"),{length:n}=o;if(0===n)return void window.ShadyCSS.prepareTemplateStyles(s,t);const r=document.createElement("style");for(let t=0;t<n;t++){const i=o[t];i.parentNode.removeChild(i),r.textContent+=i.textContent}(t=>{As.forEach((i=>{const e=Cs.get(Ms(i,t));void 0!==e&&e.keyString.forEach((t=>{const{element:{content:i}}=t,e=new Set;Array.from(i.querySelectorAll("style")).forEach((t=>{e.add(t)})),es(t,e)}))}))})(t);const l=s.content;e?function(t,i,e=null){const{element:{content:s},parts:o}=t;if(null==e)return void s.appendChild(i);const n=document.createTreeWalker(s,133,null,!1);let r=os(o),l=0,h=-1;for(;n.nextNode();)for(h++,n.currentNode===e&&(l=ss(i),e.parentNode.insertBefore(i,e));-1!==r&&o[r].index===h;){if(l>0){for(;-1!==r;)o[r].index+=l,r=os(o,r);return}r=os(o,r)}}(e,r,l.firstChild):l.insertBefore(r,l.firstChild),window.ShadyCSS.prepareTemplateStyles(s,t);const h=l.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==h)i.insertBefore(h.cloneNode(!0),i.firstChild);else if(e){l.insertBefore(r,l.firstChild);const t=new Set;t.add(r),es(e,t)}};window.JSCompiler_renameProperty=(t,i)=>t;const Us={toAttribute(t,i){switch(i){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){switch(i){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},Ps=(t,i)=>i!==t&&(i==i||t==t),Ns={attribute:!0,type:String,converter:Us,reflect:!1,hasChanged:Ps};class Rs extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach(((i,e)=>{const s=this._attributeNameForProperty(e,i);void 0!==s&&(this._attributeToPropertyMap.set(s,e),t.push(s))})),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach(((t,i)=>this._classProperties.set(i,t)))}}static createProperty(t,i=Ns){if(this._ensureClassProperties(),this._classProperties.set(t,i),i.noAccessor||this.prototype.hasOwnProperty(t))return;const e="symbol"==typeof t?Symbol():`__${t}`,s=this.getPropertyDescriptor(t,e,i);void 0!==s&&Object.defineProperty(this.prototype,t,s)}static getPropertyDescriptor(t,i,e){return{get(){return this[i]},set(s){const o=this[t];this[i]=s,this.requestUpdateInternal(t,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this._classProperties&&this._classProperties.get(t)||Ns}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,i=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const e of i)this.createProperty(e,t[e])}}static _attributeNameForProperty(t,i){const e=i.attribute;return!1===e?void 0:"string"==typeof e?e:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,i,e=Ps){return e(t,i)}static _propertyValueFromAttribute(t,i){const e=i.type,s=i.converter||Us,o="function"==typeof s?s:s.fromAttribute;return o?o(t,e):t}static _propertyValueToAttribute(t,i){if(void 0===i.reflect)return;const e=i.type,s=i.converter;return(s&&s.toAttribute||Us.toAttribute)(t,e)}initialize(){this._updateState=0,this._updatePromise=new Promise((t=>this._enableUpdatingResolver=t)),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach(((t,i)=>{if(this.hasOwnProperty(i)){const t=this[i];delete this[i],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(i,t)}}))}_applyInstanceProperties(){this._instanceProperties.forEach(((t,i)=>this[i]=t)),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,i,e){i!==e&&this._attributeToProperty(t,e)}_propertyToAttribute(t,i,e=Ns){const s=this.constructor,o=s._attributeNameForProperty(t,e);if(void 0!==o){const t=s._propertyValueToAttribute(i,e);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(o):this.setAttribute(o,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,i){if(8&this._updateState)return;const e=this.constructor,s=e._attributeToPropertyMap.get(t);if(void 0!==s){const t=e.getPropertyOptions(s);this._updateState=16|this._updateState,this[s]=e._propertyValueFromAttribute(i,t),this._updateState=-17&this._updateState}}requestUpdateInternal(t,i,e){let s=!0;if(void 0!==t){const o=this.constructor;e=e||o.getPropertyOptions(t),o._valueHasChanged(this[t],i,e.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,i),!0!==e.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,e))):s=!1}!this._hasRequestedUpdate&&s&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(t,i){return this.requestUpdateInternal(t,i),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(t){}const t=this.performUpdate();return null!=t&&await t,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let t=!1;const i=this._changedProperties;try{t=this.shouldUpdate(i),t?this.update(i):this._markUpdated()}catch(i){throw t=!1,this._markUpdated(),i}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(i)),this.updated(i))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach(((t,i)=>this._propertyToAttribute(i,this[i],t))),this._reflectingProperties=void 0),this._markUpdated()}updated(t){}firstUpdated(t){}}Rs.finalized=!0;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const Ws=(t,i)=>"method"===i.kind&&i.descriptor&&!("value"in i.descriptor)?Object.assign(Object.assign({},i),{finisher(e){e.createProperty(i.key,t)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof i.initializer&&(this[i.key]=i.initializer.call(this))},finisher(e){e.createProperty(i.key,t)}};function Ls(t){return(i,e)=>void 0!==e?((t,i,e)=>{i.constructor.createProperty(e,t)})(t,i,e):Ws(t,i)}const Bs=(t,i,e)=>{Object.defineProperty(i,e,t)},qs=(t,i)=>({kind:"method",placement:"prototype",key:i.key,descriptor:t})
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/,Vs=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Fs=Symbol();class Hs{constructor(t,i){if(i!==Fs)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(Vs?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const Js={};class Ds extends Rs{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const t=this.getStyles();if(Array.isArray(t)){const i=(t,e)=>t.reduceRight(((t,e)=>Array.isArray(e)?i(e,t):(t.add(e),t)),e),e=i(t,new Set),s=[];e.forEach((t=>s.unshift(t))),this._styles=s}else this._styles=void 0===t?[]:[t];this._styles=this._styles.map((t=>{if(t instanceof CSSStyleSheet&&!Vs){const i=Array.prototype.slice.call(t.cssRules).reduce(((t,i)=>t+i.cssText),"");return new Hs(String(i),Fs)}return t}))}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?Vs?this.renderRoot.adoptedStyleSheets=t.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map((t=>t.cssText)),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){const i=this.render();super.update(t),i!==Js&&this.constructor.render(i,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach((t=>{const i=document.createElement("style");i.textContent=t.cssText,this.renderRoot.appendChild(i)})))}render(){return Js}}Ds.finalized=!0,Ds.render=(t,i,e)=>{if(!e||"object"!=typeof e||!e.scopeName)throw new Error("The `scopeName` option is required.");const s=e.scopeName,o=ks.has(i),n=js&&11===i.nodeType&&!!i.host,r=n&&!Os.has(s),l=r?document.createDocumentFragment():i;if(((t,i,e)=>{let s=ks.get(i);void 0===s&&(De(i,i.firstChild),ks.set(i,s=new gs(Object.assign({templateFactory:$s},e))),s.appendInto(i)),s.setValue(t),s.commit()})(t,l,Object.assign({templateFactory:Es(s)},e)),r){const t=ks.get(l);ks.delete(l);const e=t.value instanceof cs?t.value.template:void 0;Is(s,l,e),De(i,i.firstChild),i.appendChild(l),ks.set(i,t)}!o&&n&&window.ShadyCSS.styleElement(i.host)},Ds.shadowRootOptions={mode:"open"};const Zs=new Set;new MutationObserver((()=>{const t="rtl"===document.documentElement.dir?document.documentElement.dir:"ltr";Zs.forEach((i=>{i.setAttribute("dir",t)}))})).observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});class Gs extends(function(t){class i extends t{constructor(){super(...arguments),this.dir="ltr"}get isLTR(){return"ltr"===this.dir}connectedCallback(){if(!this.hasAttribute("dir")){let i=this.assignedSlot||this.parentNode;for(;i!==document.documentElement&&(void 0===(t=i).startManagingContentDirection&&"SP-THEME"!==t.tagName);)i=i.assignedSlot||i.parentNode||i.host;if(this.dir="rtl"===i.dir?i.dir:this.dir||"ltr",i===document.documentElement)Zs.add(this);else{const{localName:t}=i;t.search("-")>-1&&!customElements.get(t)?customElements.whenDefined(t).then((()=>{i.startManagingContentDirection(this)})):i.startManagingContentDirection(this)}this._dirParent=i}var t;super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._dirParent&&(this._dirParent===document.documentElement?Zs.delete(this):this._dirParent.stopManagingContentDirection(this),this.removeAttribute("dir"))}}return He([Ls({reflect:!0})],i.prototype,"dir",void 0),i}(Ds)){}
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const Ks=new WeakMap,Qs=(t=>(...i)=>{const e=t(...i);return ns.set(e,!0),e})((t=>i=>{const e=Ks.get(i);if(void 0===t&&i instanceof ws){if(void 0!==e||!Ks.has(i)){const t=i.committer.name;i.committer.element.removeAttribute(t)}}else t!==e&&i.setValue(t);Ks.set(i,t)}));class Xs{constructor(){this.iconsetMap=new Map}static getInstance(){return Xs.instance||(Xs.instance=new Xs),Xs.instance}addIconset(t,i){this.iconsetMap.set(t,i);const e=new CustomEvent("sp-iconset-added",{bubbles:!0,composed:!0,detail:{name:t,iconset:i}});setTimeout((()=>window.dispatchEvent(e)),0)}removeIconset(t){this.iconsetMap.delete(t);const i=new CustomEvent("sp-iconset-removed",{bubbles:!0,composed:!0,detail:{name:t}});setTimeout((()=>window.dispatchEvent(i)),0)}getIconset(t){return this.iconsetMap.get(t)}}const Ys=((t,...i)=>{const e=i.reduce(((i,e,s)=>i+(t=>{if(t instanceof Hs)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(e)+t[s+1]),t[0]);return new Hs(e,Fs)})`
:host{display:inline-block;color:inherit;fill:currentColor;pointer-events:none}:host(:not(:root)){overflow:hidden}@media (forced-colors:active){.spectrum-UIIcon,:host{forced-color-adjust:auto}}:host{--spectrum-icon-size-s:var(--spectrum-alias-workflow-icon-size-s,var(--spectrum-global-dimension-size-200));--spectrum-icon-size-m:var(--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225));--spectrum-icon-size-l:var(--spectrum-alias-workflow-icon-size-l);--spectrum-icon-size-xl:var(--spectrum-alias-workflow-icon-size-xl,var(--spectrum-global-dimension-size-275));--spectrum-icon-size-xxl:var(--spectrum-global-dimension-size-400)}:host([size=s]){height:var(--spectrum-icon-size-s);width:var(--spectrum-icon-size-s)}:host([size=m]){height:var(--spectrum-icon-size-m);width:var(--spectrum-icon-size-m)}:host([size=l]){height:var(--spectrum-icon-size-l);width:var(--spectrum-icon-size-l)}:host([size=xl]){height:var(--spectrum-icon-size-xl);width:var(--spectrum-icon-size-xl)}:host([size=xxl]){height:var(--spectrum-icon-size-xxl);width:var(--spectrum-icon-size-xxl)}:host{height:var(--spectrum-icon-tshirt-size-height,var(--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)));width:var(--spectrum-icon-tshirt-size-width,var(--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)))}#container{height:100%}::slotted(*),img,svg{height:100%;width:100%;vertical-align:top}
`;class to extends Gs{static get styles(){return[Ys]}render(){return _s`
            <slot></slot>
        `}}He([Ls()],to.prototype,"label",void 0),He([Ls({reflect:!0})],to.prototype,"size",void 0);class io extends to{constructor(){super(...arguments),this.iconsetListener=t=>{if(!this.name)return;const i=this.parseIcon(this.name);t.detail.name===i.iconset&&(this.updateIconPromise=this.updateIcon())}}connectedCallback(){super.connectedCallback(),window.addEventListener("sp-iconset-added",this.iconsetListener)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sp-iconset-added",this.iconsetListener)}firstUpdated(){this.updateIconPromise=this.updateIcon()}attributeChangedCallback(t,i,e){super.attributeChangedCallback(t,i,e),this.updateIconPromise=this.updateIcon()}render(){return this.name?_s`
                <div id="container"></div>
            `:this.src?_s`
                <img src="${this.src}" alt=${Qs(this.label)} />
            `:super.render()}async updateIcon(){if(!this.name)return Promise.resolve();const t=this.parseIcon(this.name),i=Xs.getInstance().getIconset(t.iconset);return i&&this.iconContainer?(this.iconContainer.innerHTML="",i.applyIconToElement(this.iconContainer,t.icon,this.size||"",this.label?this.label:"")):Promise.resolve()}parseIcon(t){const i=t.split(":");let e="default",s=t;return i.length>1&&(e=i[0],s=i[1]),{iconset:e,icon:s}}async _getUpdateComplete(){await super._getUpdateComplete(),await this.updateIconPromise}}var eo,so;He([Ls()],io.prototype,"src",void 0),He([Ls()],io.prototype,"name",void 0),He([(eo="#container",(t,i)=>{const e={get(){return this.renderRoot.querySelector(eo)},enumerable:!0,configurable:!0};if(so){const s=void 0!==i?i:t.key,o="symbol"==typeof s?Symbol():`__${s}`;e.get=function(){return void 0===this[o]&&(this[o]=this.renderRoot.querySelector(eo)),this[o]}}return void 0!==i?Bs(e,t,i):qs(e,t)})],io.prototype,"iconContainer",void 0);class oo extends io{constructor(){super()}static get styles(){return[super.styles||[],pi`:host {
                display: inline-flex;
                font-size: var(--ewc-icon-size, var(--ewc-alias-icon-size,  var(--ewc-icon-size-m, 1.25rem)));
                padding: var(--ewc-icon-padding, var(--ewc-alias-icon-padding, var(--ewc-size-50)));
                align-items: center;
                justify-content: center;

                --ewc-alias-icon-size: 1rem;
                --ewc-icon-size-s: .75rem;
                --ewc-icon-size-m: 1rem;
                --ewc-icon-size-l: 1.5rem;
                --ewc-icon-size-xl: 2rem;
                --ewc-icon-size-xxl: 3rem;

                --ewc-icon-padding-s: .25rem;
                --ewc-icon-padding-m: .5rem;
                --ewc-icon-padding-l: .75rem;
                --ewc-icon-padding-xl: 1rem;
                --ewc-icon-padding-xxl: 1.5rem;
            }

            ::slotted(:is(svg,i,a)) {
                display: inline-block;
                color: var(--ewc-icon-color, var(--ewc-alias-icon-color, currentColor));
                height: 1em;
                width: 1em;
                line-height: 1;
                text-align: center;
                fill: currentColor;
            }

            :host([size="s"]) { --ewc-alias-icon-size: var(--ewc-icon-size-s) }
            :host([size="m"]) { --ewc-alias-icon-size: var(--ewc-icon-size-m) }
            :host([size="l"]) { --ewc-alias-icon-size: var(--ewc-icon-size-l) }
            :host([size="xl"]) { --ewc-alias-icon-size: var(--ewc-icon-size-xl) }
            :host([size="xxl"]) { --ewc-alias-icon-size: var(--ewc-icon-size-xxl) }

            :host(:is([stacked],[bordered])) {
                padding: var(--ewc-icon-padding, var(--ewc-alias-icon-padding, var(--ewc-size-50)));
            }

            :host([stacked]) {
                background-color: var(--ewc-icon-color ,var(--ewc-alias-icon-color ,var(--ewc-color-gray-200)));
            }

            :host([stacked]:is([color])) ::slotted(:is(svg,i,a)) {
                color: #fff;
            }

            :host([bordered]) {
                border-style: var(--ewc-icon-border-style, solid);
                border-color: var(--ewc-icon-border-color, var(--ewc-alias-icon-color, var(--ewc-color-gray-300)));
                border-width: var(--ewc-icon-border-color, 1px);
            }

            :host([color="blue"])       { --ewc-alias-icon-color: var(--ewc-color-blue-500) }
            :host([color="celery"])     { --ewc-alias-icon-color: var(--ewc-color-celery-500) }
            :host([color="error"])      { --ewc-alias-icon-color: var(--ewc-color-error) }
            :host([color="fuchsia"])    { --ewc-alias-icon-color: var(--ewc-color-fuchsia-500) }
            :host([color="green"])      { --ewc-alias-icon-color: var(--ewc-color-green-500) }
            :host([color="indigo"])     { --ewc-alias-icon-color: var(--ewc-color-indigo-500) }
            :host([color="lime"])       { --ewc-alias-icon-color: var(--ewc-color-lime) }
            :host([color="magenta"])    { --ewc-alias-icon-color: var(--ewc-color-magenta-500) }
            :host([color="orange"])     { --ewc-alias-icon-color: var(--ewc-color-orange-500) }
            :host([color="primary"])    { --ewc-alias-icon-color: var(--ewc-color-primary) }
            :host([color="purple"])     { --ewc-alias-icon-color: var(--ewc-color-purple-500) }
            :host([color="secondary"])  { --ewc-alias-icon-color: var(--ewc-color-secondary) }
            :host([color="success"])    { --ewc-alias-icon-color: var(--ewc-color-success) }
            :host([color="teal"])       { --ewc-alias-icon-color: var(--ewc-color-teal-500) }
            :host([color="warning"])    { --ewc-alias-icon-color: var(--ewc-color-warning) }
            :host([color="yellow"])     { --ewc-alias-icon-color: var(--ewc-color-yellow-500) }

            :host(:is([padding="s"],[size="s"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-s) }
            :host(:is([padding="m"],[size="m"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-m) }
            :host(:is([padding="l"],[size="l"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-l) }
            :host(:is([padding="xl"],[size="xl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xl) }
            :host(:is([padding="xxl"],[size="xxl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xxl) }

            :host([circular]) { border-radius: 100%; }`]}}customElements.define("e-icon",oo);class no extends ni{static get styles(){return ct`
			:host([size="xs"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xs)); }
		  	:host([size="s"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-s)); }
		  	:host([size="m"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-m)); }
		  	:host([size="l"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-l)); }
		  	:host([size="xl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xl)); }
		  	:host([size="xxl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xxl)); }
		  	:host([size="xxxl"]){
			  font-size: var(--ewc-alias-size-font-body, var(--ewc-size-font-body-xxxl)); }`}static get properties(){return{align:{type:String,reflect:!0},color:{type:String,reflect:!0},font:{type:String,reflect:!0},italic:{type:Boolean,reflect:!0},size:{type:String,reflect:!0},transform:{type:String,reflect:!0},weight:{type:String,reflect:!0}}}safeGetPropertyValue(t,i){return t?i[t]?i[t]:[...i.keys()].includes(t)?t:"":""}getColorStyle(){const t=[];t.green="green-500",t.celery="celery-500",t.chartreuse="chartreuse-500",t.seafoam="seafoam-500",t.blue="blue-500",t.purple="purple-500",t.indigo="indigo-500",t.fucsia="fucsia-500",t.magenta="magenta-500",t.red="red-500",t.orange="orange-500",t.yellow="yellow-500",t.primary="primary",t.secondary="secondary",t.cta="cta",t.success="success",t.warning="warning",t.error="error",t.info="info";const i="var(--ewc-color-"+this.safeGetPropertyValue(this.color,t)+")";return ct`h1, h2, h3, h4, h5, h6{
			color: var( --ewc-heading-color, ${ht(i)}) !important;
		}`}getFlexItemStyle(){const t=[];t.grow="auto",t.shrink="0 auto",t.stiff="none",t.flexible="1";const i=[0,1,2,3,4,5,6],e=[];e.auto="auto",e.start="flex-start",e.end="flex-end",e.center="center",e.baseline="baseline",e.stretch="stretch";const s=this.safeGetPropertyValue(this.flex,t),o=this.safeGetPropertyValue(this.grow,i),n=this.safeGetPropertyValue(this.order,[0,1,2,3,4,5,6,7,8,9]),r=this.safeGetPropertyValue(this.shrink,i),l=this.safeGetPropertyValue(this.alignSelf,e);return ct`:host{
			--ewc-flex-flex: ${ht(s)};
			--ewc-flex-grow: ${ht(o)};
			--ewc-flex-order: ${ht(n)};
			--ewc-flex-shrink: ${ht(r)};
			--ewc-flex-align-self: ${ht(l)};
		}`}constructor(){super(),this.type="p",this.color="gray-900",this.flex=null,this.grow=null,this.shrink=null,this.alignSelf=null,this.order=null}render(){return Wt`
			<style>
				${this.getFlexItemStyle()}
				${this.getColorStyle()}
			</style>
			<slot></slot>`}}window.customElements.define("e-text",no);export{hi as Box,li as Button,oo as EIcon,ci as Flex,et as Heading,no as Text};
