/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol();class o{constructor(t,o){if(o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return t&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const s=new Map,e=t=>{let e=s.get(t);return void 0===e&&s.set(t,e=new o(t,i)),e},r=(t,...i)=>{const s=1===t.length?t[0]:i.reduce(((i,s,e)=>i+(t=>{if(t instanceof o)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[e+1]),t[0]);return e(s)},n=t?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const o of t.cssRules)i+=o.cssText;return(t=>e("string"==typeof t?t:t+""))(i)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var l,a,c,h;const d={toAttribute(t,i){switch(i){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let o=t;switch(i){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},u=(t,i)=>i!==t&&(i==i||t==t),v={attribute:!0,type:String,converter:d,reflect:!1,hasChanged:u};class b extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var i;null!==(i=this.v)&&void 0!==i||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,o)=>{const s=this.Πp(o,i);void 0!==s&&(this.Πm.set(s,o),t.push(s))})),t}static createProperty(t,i=v){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const o="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,o,i);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,i,o){return{get(){return this[i]},set(s){const e=this[t];this[i]=s,this.requestUpdate(t,e,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||v}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const o of i)this.createProperty(o,t[o])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)i.unshift(n(t))}else void 0!==t&&i.push(n(t));return i}static Πp(t,i){const o=i.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,o;(null!==(i=this.ΠU)&&void 0!==i?i:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(o=t.hostConnected)||void 0===o||o.call(t))}removeController(t){var i;null===(i=this.ΠU)||void 0===i||i.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this.Πi.set(i,this[i]),delete this[i])}))}createRenderRoot(){var i;const o=null!==(i=this.shadowRoot)&&void 0!==i?i:this.attachShadow(this.constructor.shadowRootOptions);return((i,o)=>{t?i.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):o.forEach((t=>{const o=document.createElement("style");o.textContent=t.cssText,i.appendChild(o)}))})(o,this.constructor.elementStyles),o}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,i,o){this.K(t,o)}Πj(t,i,o=v){var s,e;const r=this.constructor.Πp(t,o);if(void 0!==r&&!0===o.reflect){const n=(null!==(e=null===(s=o.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==e?e:d.toAttribute)(i,o.type);this.Πh=t,null==n?this.removeAttribute(r):this.setAttribute(r,n),this.Πh=null}}K(t,i){var o,s,e;const r=this.constructor,n=r.Πm.get(t);if(void 0!==n&&this.Πh!==n){const t=r.getPropertyOptions(n),l=t.converter,a=null!==(e=null!==(s=null===(o=l)||void 0===o?void 0:o.fromAttribute)&&void 0!==s?s:"function"==typeof l?l:null)&&void 0!==e?e:d.fromAttribute;this.Πh=n,this[n]=a(i,t.type),this.Πh=null}}requestUpdate(t,i,o){let s=!0;void 0!==t&&(((o=o||this.constructor.getPropertyOptions(t)).hasChanged||u)(this[t],i)?(this.L.has(t)||this.L.set(t,i),!0===o.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,o))):s=!1),!this.isUpdatePending&&s&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,i)=>this[i]=t)),this.Πi=void 0);let i=!1;const o=this.L;try{i=this.shouldUpdate(o),i?(this.willUpdate(o),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(o)):this.Π$()}catch(t){throw i=!1,this.Π$(),t}i&&this.E(o)}willUpdate(t){}E(t){var i;null===(i=this.ΠU)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,i)=>this.Πj(i,this[i],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var w,p,f,g;b.finalized=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},null===(a=(l=globalThis).reactiveElementPlatformSupport)||void 0===a||a.call(l,{ReactiveElement:b}),(null!==(c=(h=globalThis).reactiveElementVersions)&&void 0!==c?c:h.reactiveElementVersions=[]).push("1.0.0-rc.2");const y=globalThis.trustedTypes,m=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,x=`lit$${(Math.random()+"").slice(9)}$`,z="?"+x,S=`<${z}>`,C=document,$=(t="")=>C.createComment(t),k=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,A=/-->/g,E=/>/g,O=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,j=/'/g,U=/"/g,N=/^(?:script|style|textarea)$/i,R=(t=>(i,...o)=>({_$litType$:t,strings:i,values:o}))(1),q=Symbol.for("lit-noChange"),_=Symbol.for("lit-nothing"),P=new WeakMap,I=C.createTreeWalker(C,129,null,!1),L=(t,i)=>{const o=t.length-1,s=[];let e,r=2===i?"<svg>":"",n=M;for(let i=0;i<o;i++){const o=t[i];let l,a,c=-1,h=0;for(;h<o.length&&(n.lastIndex=h,a=n.exec(o),null!==a);)h=n.lastIndex,n===M?"!--"===a[1]?n=A:void 0!==a[1]?n=E:void 0!==a[2]?(N.test(a[2])&&(e=RegExp("</"+a[2],"g")),n=O):void 0!==a[3]&&(n=O):n===O?">"===a[0]?(n=null!=e?e:M,c=-1):void 0===a[1]?c=-2:(c=n.lastIndex-a[2].length,l=a[1],n=void 0===a[3]?O:'"'===a[3]?U:j):n===U||n===j?n=O:n===A||n===E?n=M:(n=O,e=void 0);const d=n===O&&t[i+1].startsWith("/>")?" ":"";r+=n===M?o+S:c>=0?(s.push(l),o.slice(0,c)+"$lit$"+o.slice(c)+x+d):o+x+(-2===c?(s.push(void 0),i):d)}const l=r+(t[o]||"<?>")+(2===i?"</svg>":"");return[void 0!==m?m.createHTML(l):l,s]};class W{constructor({strings:t,_$litType$:i},o){let s;this.parts=[];let e=0,r=0;const n=t.length-1,l=this.parts,[a,c]=L(t,i);if(this.el=W.createElement(a,o),I.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(s=I.nextNode())&&l.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const i of s.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(x)){const o=c[r++];if(t.push(i),void 0!==o){const t=s.getAttribute(o.toLowerCase()+"$lit$").split(x),i=/([.?@])?(.*)/.exec(o);l.push({type:1,index:e,name:i[2],strings:t,ctor:"."===i[1]?K:"?"===i[1]?Z:"@"===i[1]?V:J})}else l.push({type:6,index:e})}for(const i of t)s.removeAttribute(i)}if(N.test(s.tagName)){const t=s.textContent.split(x),i=t.length-1;if(i>0){s.textContent=y?y.emptyScript:"";for(let o=0;o<i;o++)s.append(t[o],$()),I.nextNode(),l.push({type:2,index:++e});s.append(t[i],$())}}}else if(8===s.nodeType)if(s.data===z)l.push({type:2,index:e});else{let t=-1;for(;-1!==(t=s.data.indexOf(x,t+1));)l.push({type:7,index:e}),t+=x.length-1}e++}}static createElement(t,i){const o=C.createElement("template");return o.innerHTML=t,o}}function D(t,i,o=t,s){var e,r,n,l;if(i===q)return i;let a=void 0!==s?null===(e=o.Σi)||void 0===e?void 0:e[s]:o.Σo;const c=k(i)?void 0:i._$litDirective$;return(null==a?void 0:a.constructor)!==c&&(null===(r=null==a?void 0:a.O)||void 0===r||r.call(a,!1),void 0===c?a=void 0:(a=new c(t),a.T(t,o,s)),void 0!==s?(null!==(n=(l=o).Σi)&&void 0!==n?n:l.Σi=[])[s]=a:o.Σo=a),void 0!==a&&(i=D(t,a.S(t,i.values),a,s)),i}class B{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:o},parts:s}=this.D,e=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:C).importNode(o,!0);I.currentNode=e;let r=I.nextNode(),n=0,l=0,a=s[0];for(;void 0!==a;){if(n===a.index){let i;2===a.type?i=new H(r,r.nextSibling,this,t):1===a.type?i=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(i=new F(r,this,t)),this.l.push(i),a=s[++l]}n!==(null==a?void 0:a.index)&&(r=I.nextNode(),n++)}return e}v(t){let i=0;for(const o of this.l)void 0!==o&&(void 0!==o.strings?(o.I(t,o,i),i+=o.strings.length-2):o.I(t[i])),i++}}class H{constructor(t,i,o,s){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=o,this.options=s}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=D(this,t,i),k(t)?t===_||null==t||""===t?(this.H!==_&&this.R(),this.H=_):t!==this.H&&t!==q&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return T(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(C.createTextNode(t)),this.H=t}_(t){var i;const{values:o,_$litType$:s}=t,e="number"==typeof s?this.C(t):(void 0===s.el&&(s.el=W.createElement(s.h,this.options)),s);if((null===(i=this.H)||void 0===i?void 0:i.D)===e)this.H.v(o);else{const t=new B(e,this),i=t.u(this.options);t.v(o),this.$(i),this.H=t}}C(t){let i=P.get(t.strings);return void 0===i&&P.set(t.strings,i=new W(t)),i}g(t){T(this.H)||(this.H=[],this.R());const i=this.H;let o,s=0;for(const e of t)s===i.length?i.push(o=new H(this.k($()),this.k($()),this,this.options)):o=i[s],o.I(e),s++;s<i.length&&(this.R(o&&o.B.nextSibling,s),i.length=s)}R(t=this.A.nextSibling,i){var o;for(null===(o=this.P)||void 0===o||o.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class J{constructor(t,i,o,s,e){this.type=1,this.H=_,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=s,this.options=e,o.length>2||""!==o[0]||""!==o[1]?(this.H=Array(o.length-1).fill(_),this.strings=o):this.H=_}get tagName(){return this.element.tagName}I(t,i=this,o,s){const e=this.strings;let r=!1;if(void 0===e)t=D(this,t,i,0),r=!k(t)||t!==this.H&&t!==q,r&&(this.H=t);else{const s=t;let n,l;for(t=e[0],n=0;n<e.length-1;n++)l=D(this,s[o+n],i,n),l===q&&(l=this.H[n]),r||(r=!k(l)||l!==this.H[n]),l===_?t=_:t!==_&&(t+=(null!=l?l:"")+e[n+1]),this.H[n]=l}r&&!s&&this.W(t)}W(t){t===_?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class K extends J{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===_?void 0:t}}class Z extends J{constructor(){super(...arguments),this.type=4}W(t){t&&t!==_?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class V extends J{constructor(){super(...arguments),this.type=5}I(t,i=this){var o;if((t=null!==(o=D(this,t,i,0))&&void 0!==o?o:_)===q)return;const s=this.H,e=t===_&&s!==_||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==_&&(s===_||e);e&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,o;"function"==typeof this.H?this.H.call(null!==(o=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==o?o:this.element,t):this.H.handleEvent(t)}}class F{constructor(t,i,o){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=o}I(t){D(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var G,Q,X,Y,tt,it;null===(p=(w=globalThis).litHtmlPlatformSupport)||void 0===p||p.call(w,W,H),(null!==(f=(g=globalThis).litHtmlVersions)&&void 0!==f?f:g.litHtmlVersions=[]).push("2.0.0-rc.3"),(null!==(G=(it=globalThis).litElementVersions)&&void 0!==G?G:it.litElementVersions=[]).push("3.0.0-rc.2");class ot extends b{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,i;const o=super.createRenderRoot();return null!==(t=(i=this.renderOptions).renderBefore)&&void 0!==t||(i.renderBefore=o.firstChild),o}update(t){const i=this.render();super.update(t),this.Φt=((t,i,o)=>{var s,e;const r=null!==(s=null==o?void 0:o.renderBefore)&&void 0!==s?s:i;let n=r._$litPart$;if(void 0===n){const t=null!==(e=null==o?void 0:o.renderBefore)&&void 0!==e?e:null;r._$litPart$=n=new H(i.insertBefore($(),t),t,void 0,o)}return n.I(t),n})(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return q}}ot.finalized=!0,ot._$litElement$=!0,null===(X=(Q=globalThis).litElementHydrateSupport)||void 0===X||X.call(Q,{LitElement:ot}),null===(tt=(Y=globalThis).litElementPlatformSupport)||void 0===tt||tt.call(Y,{LitElement:ot});class st extends ot{static get styles(){return r`
        .btn {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            z-index: 1;
        }

        ::slotted(a) {
            color: currentColor;
            text-decoration: none;
            display: flex;
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
            color: #fff;
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
        }`}render(){return R`
            <div class="bg-layer"></div>
            <div class="btn">
                <slot name="icon"></slot>
                <slot name="title"></slot>
                <slot></slot>
            </div>`}}window.customElements.define("e-button",st);export{st as Button};
