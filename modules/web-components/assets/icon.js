/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol();class s{constructor(t,s){if(s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return t&&void 0===this.t&&(this.t=new CSSStyleSheet,this.t.replaceSync(this.cssText)),this.t}toString(){return this.cssText}}const e=new Map,o=t=>{let o=e.get(t);return void 0===o&&e.set(t,o=new s(t,i)),o},n=(t,...i)=>{const e=1===t.length?t[0]:i.reduce(((i,e,o)=>i+(t=>{if(t instanceof s)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(e)+t[o+1]),t[0]);return o(e)},r=t?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const s of t.cssRules)i+=s.cssText;return(t=>o("string"==typeof t?t:t+""))(i)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var h,c,l,a;const d={toAttribute(t,i){switch(i){case Boolean:t=t?"":null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},u=(t,i)=>i!==t&&(i==i||t==t),v={attribute:!0,type:String,converter:d,reflect:!1,hasChanged:u};class p extends HTMLElement{constructor(){super(),this.Πi=new Map,this.Πo=void 0,this.Πl=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.Πh=null,this.u()}static addInitializer(t){var i;null!==(i=this.v)&&void 0!==i||(this.v=[]),this.v.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this.Πp(s,i);void 0!==e&&(this.Πm.set(e,s),t.push(e))})),t}static createProperty(t,i=v){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e)}}static getPropertyDescriptor(t,i,s){return{get(){return this[i]},set(e){const o=this[t];this[i]=e,this.requestUpdate(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||v}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this.Πm=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)i.unshift(r(t))}else void 0!==t&&i.push(r(t));return i}static Πp(t,i){const s=i.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this.Πg=new Promise((t=>this.enableUpdating=t)),this.L=new Map,this.Π_(),this.requestUpdate(),null===(t=this.constructor.v)||void 0===t||t.forEach((t=>t(this)))}addController(t){var i,s;(null!==(i=this.ΠU)&&void 0!==i?i:this.ΠU=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t))}removeController(t){var i;null===(i=this.ΠU)||void 0===i||i.splice(this.ΠU.indexOf(t)>>>0,1)}Π_(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this.Πi.set(i,this[i]),delete this[i])}))}createRenderRoot(){var i;const s=null!==(i=this.shadowRoot)&&void 0!==i?i:this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{t?i.adoptedStyleSheets=s.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):s.forEach((t=>{const s=document.createElement("style");s.textContent=t.cssText,i.appendChild(s)}))})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)})),this.Πl&&(this.Πl(),this.Πo=this.Πl=void 0)}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)})),this.Πo=new Promise((t=>this.Πl=t))}attributeChangedCallback(t,i,s){this.K(t,s)}Πj(t,i,s=v){var e,o;const n=this.constructor.Πp(t,s);if(void 0!==n&&!0===s.reflect){const r=(null!==(o=null===(e=s.converter)||void 0===e?void 0:e.toAttribute)&&void 0!==o?o:d.toAttribute)(i,s.type);this.Πh=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this.Πh=null}}K(t,i){var s,e,o;const n=this.constructor,r=n.Πm.get(t);if(void 0!==r&&this.Πh!==r){const t=n.getPropertyOptions(r),h=t.converter,c=null!==(o=null!==(e=null===(s=h)||void 0===s?void 0:s.fromAttribute)&&void 0!==e?e:"function"==typeof h?h:null)&&void 0!==o?o:d.fromAttribute;this.Πh=r,this[r]=c(i,t.type),this.Πh=null}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||u)(this[t],i)?(this.L.has(t)||this.L.set(t,i),!0===s.reflect&&this.Πh!==t&&(void 0===this.Πk&&(this.Πk=new Map),this.Πk.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this.Πg=this.Πq())}async Πq(){this.isUpdatePending=!0;try{for(await this.Πg;this.Πo;)await this.Πo}catch(t){Promise.reject(t)}const t=this.performUpdate();return null!=t&&await t,!this.isUpdatePending}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this.Πi&&(this.Πi.forEach(((t,i)=>this[i]=t)),this.Πi=void 0);let i=!1;const s=this.L;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this.ΠU)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this.Π$()}catch(t){throw i=!1,this.Π$(),t}i&&this.E(s)}willUpdate(t){}E(t){var i;null===(i=this.ΠU)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}Π$(){this.L=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.Πg}shouldUpdate(t){return!0}update(t){void 0!==this.Πk&&(this.Πk.forEach(((t,i)=>this.Πj(i,this[i],t))),this.Πk=void 0),this.Π$()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var f,w,m,g;p.finalized=!0,p.elementProperties=new Map,p.elementStyles=[],p.shadowRootOptions={mode:"open"},null===(c=(h=globalThis).reactiveElementPlatformSupport)||void 0===c||c.call(h,{ReactiveElement:p}),(null!==(l=(a=globalThis).reactiveElementVersions)&&void 0!==l?l:a.reactiveElementVersions=[]).push("1.0.0-rc.2");const y=globalThis.trustedTypes,b=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,x=`lit$${(Math.random()+"").slice(9)}$`,S="?"+x,z=`<${S}>`,C=document,$=(t="")=>C.createComment(t),_=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,T=/-->/g,A=/>/g,E=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,j=/'/g,P=/"/g,O=/^(?:script|style|textarea)$/i,U=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),N=new WeakMap,R=C.createTreeWalker(C,129,null,!1);class W{constructor({strings:t,_$litType$:i},s){let e;this.parts=[];let o=0,n=0;const r=t.length-1,h=this.parts,[c,l]=((t,i)=>{const s=t.length-1,e=[];let o,n=2===i?"<svg>":"",r=M;for(let i=0;i<s;i++){const s=t[i];let h,c,l=-1,a=0;for(;a<s.length&&(r.lastIndex=a,c=r.exec(s),null!==c);)a=r.lastIndex,r===M?"!--"===c[1]?r=T:void 0!==c[1]?r=A:void 0!==c[2]?(O.test(c[2])&&(o=RegExp("</"+c[2],"g")),r=E):void 0!==c[3]&&(r=E):r===E?">"===c[0]?(r=null!=o?o:M,l=-1):void 0===c[1]?l=-2:(l=r.lastIndex-c[2].length,h=c[1],r=void 0===c[3]?E:'"'===c[3]?P:j):r===P||r===j?r=E:r===T||r===A?r=M:(r=E,o=void 0);const d=r===E&&t[i+1].startsWith("/>")?" ":"";n+=r===M?s+z:l>=0?(e.push(h),s.slice(0,l)+"$lit$"+s.slice(l)+x+d):s+x+(-2===l?(e.push(void 0),i):d)}const h=n+(t[s]||"<?>")+(2===i?"</svg>":"");return[void 0!==b?b.createHTML(h):h,e]})(t,i);if(this.el=W.createElement(c,s),R.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(e=R.nextNode())&&h.length<r;){if(1===e.nodeType){if(e.hasAttributes()){const t=[];for(const i of e.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(x)){const s=l[n++];if(t.push(i),void 0!==s){const t=e.getAttribute(s.toLowerCase()+"$lit$").split(x),i=/([.?@])?(.*)/.exec(s);h.push({type:1,index:o,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?J:"@"===i[1]?B:F})}else h.push({type:6,index:o})}for(const i of t)e.removeAttribute(i)}if(O.test(e.tagName)){const t=e.textContent.split(x),i=t.length-1;if(i>0){e.textContent=y?y.emptyScript:"";for(let s=0;s<i;s++)e.append(t[s],$()),R.nextNode(),h.push({type:2,index:++o});e.append(t[i],$())}}}else if(8===e.nodeType)if(e.data===S)h.push({type:2,index:o});else{let t=-1;for(;-1!==(t=e.data.indexOf(x,t+1));)h.push({type:7,index:o}),t+=x.length-1}o++}}static createElement(t,i){const s=C.createElement("template");return s.innerHTML=t,s}}function L(t,i,s=t,e){var o,n,r,h;if(i===U)return i;let c=void 0!==e?null===(o=s.Σi)||void 0===o?void 0:o[e]:s.Σo;const l=_(i)?void 0:i._$litDirective$;return(null==c?void 0:c.constructor)!==l&&(null===(n=null==c?void 0:c.O)||void 0===n||n.call(c,!1),void 0===l?c=void 0:(c=new l(t),c.T(t,s,e)),void 0!==e?(null!==(r=(h=s).Σi)&&void 0!==r?r:h.Σi=[])[e]=c:s.Σo=c),void 0!==c&&(i=L(t,c.S(t,i.values),c,e)),i}class V{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:s},parts:e}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:C).importNode(s,!0);R.currentNode=o;let n=R.nextNode(),r=0,h=0,c=e[0];for(;void 0!==c;){if(r===c.index){let i;2===c.type?i=new q(n,n.nextSibling,this,t):1===c.type?i=new c.ctor(n,c.name,c.strings,this,t):6===c.type&&(i=new D(n,this,t)),this.l.push(i),c=e[++h]}r!==(null==c?void 0:c.index)&&(n=R.nextNode(),r++)}return o}v(t){let i=0;for(const s of this.l)void 0!==s&&(void 0!==s.strings?(s.I(t,s,i),i+=s.strings.length-2):s.I(t[i])),i++}}class q{constructor(t,i,s,e){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=s,this.options=e}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=L(this,t,i),_(t)?t===I||null==t||""===t?(this.H!==I&&this.R(),this.H=I):t!==this.H&&t!==U&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return k(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(C.createTextNode(t)),this.H=t}_(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this.C(t):(void 0===e.el&&(e.el=W.createElement(e.h,this.options)),e);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(s);else{const t=new V(o,this),i=t.u(this.options);t.v(s),this.$(i),this.H=t}}C(t){let i=N.get(t.strings);return void 0===i&&N.set(t.strings,i=new W(t)),i}g(t){k(this.H)||(this.H=[],this.R());const i=this.H;let s,e=0;for(const o of t)e===i.length?i.push(s=new q(this.k($()),this.k($()),this,this.options)):s=i[e],s.I(o),e++;e<i.length&&(this.R(s&&s.B.nextSibling,e),i.length=e)}R(t=this.A.nextSibling,i){var s;for(null===(s=this.P)||void 0===s||s.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class F{constructor(t,i,s,e,o){this.type=1,this.H=I,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this.H=Array(s.length-1).fill(I),this.strings=s):this.H=I}get tagName(){return this.element.tagName}I(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=L(this,t,i,0),n=!_(t)||t!==this.H&&t!==U,n&&(this.H=t);else{const e=t;let r,h;for(t=o[0],r=0;r<o.length-1;r++)h=L(this,e[s+r],i,r),h===U&&(h=this.H[r]),n||(n=!_(h)||h!==this.H[r]),h===I?t=I:t!==I&&(t+=(null!=h?h:"")+o[r+1]),this.H[r]=h}n&&!e&&this.W(t)}W(t){t===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class H extends F{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===I?void 0:t}}class J extends F{constructor(){super(...arguments),this.type=4}W(t){t&&t!==I?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class B extends F{constructor(){super(...arguments),this.type=5}I(t,i=this){var s;if((t=null!==(s=L(this,t,i,0))&&void 0!==s?s:I)===U)return;const e=this.H,o=t===I&&e!==I||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==I&&(e===I||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,s;"function"==typeof this.H?this.H.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this.H.handleEvent(t)}}class D{constructor(t,i,s){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=s}I(t){L(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Z,K,G,Q;null===(w=(f=globalThis).litHtmlPlatformSupport)||void 0===w||w.call(f,W,q),(null!==(m=(g=globalThis).litHtmlVersions)&&void 0!==m?m:g.litHtmlVersions=[]).push("2.0.0-rc.3");const X=globalThis.trustedTypes,Y=X?X.createPolicy("lit-html",{createHTML:t=>t}):void 0,tt=`lit$${(Math.random()+"").slice(9)}$`,it="?"+tt,st=`<${it}>`,et=document,ot=(t="")=>et.createComment(t),nt=t=>null===t||"object"!=typeof t&&"function"!=typeof t,rt=Array.isArray,ht=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ct=/-->/g,lt=/>/g,at=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,dt=/'/g,ut=/"/g,vt=/^(?:script|style|textarea)$/i,pt=Symbol.for("lit-noChange"),ft=Symbol.for("lit-nothing"),wt=new WeakMap,mt=et.createTreeWalker(et,129,null,!1),gt=(t,i)=>{const s=t.length-1,e=[];let o,n=2===i?"<svg>":"",r=ht;for(let i=0;i<s;i++){const s=t[i];let h,c,l=-1,a=0;for(;a<s.length&&(r.lastIndex=a,c=r.exec(s),null!==c);)a=r.lastIndex,r===ht?"!--"===c[1]?r=ct:void 0!==c[1]?r=lt:void 0!==c[2]?(vt.test(c[2])&&(o=RegExp("</"+c[2],"g")),r=at):void 0!==c[3]&&(r=at):r===at?">"===c[0]?(r=null!=o?o:ht,l=-1):void 0===c[1]?l=-2:(l=r.lastIndex-c[2].length,h=c[1],r=void 0===c[3]?at:'"'===c[3]?ut:dt):r===ut||r===dt?r=at:r===ct||r===lt?r=ht:(r=at,o=void 0);const d=r===at&&t[i+1].startsWith("/>")?" ":"";n+=r===ht?s+st:l>=0?(e.push(h),s.slice(0,l)+"$lit$"+s.slice(l)+tt+d):s+tt+(-2===l?(e.push(void 0),i):d)}const h=n+(t[s]||"<?>")+(2===i?"</svg>":"");return[void 0!==Y?Y.createHTML(h):h,e]};class yt{constructor({strings:t,_$litType$:i},s){let e;this.parts=[];let o=0,n=0;const r=t.length-1,h=this.parts,[c,l]=gt(t,i);if(this.el=yt.createElement(c,s),mt.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes)}for(;null!==(e=mt.nextNode())&&h.length<r;){if(1===e.nodeType){if(e.hasAttributes()){const t=[];for(const i of e.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(tt)){const s=l[n++];if(t.push(i),void 0!==s){const t=e.getAttribute(s.toLowerCase()+"$lit$").split(tt),i=/([.?@])?(.*)/.exec(s);h.push({type:1,index:o,name:i[2],strings:t,ctor:"."===i[1]?Ct:"?"===i[1]?$t:"@"===i[1]?_t:zt})}else h.push({type:6,index:o})}for(const i of t)e.removeAttribute(i)}if(vt.test(e.tagName)){const t=e.textContent.split(tt),i=t.length-1;if(i>0){e.textContent=X?X.emptyScript:"";for(let s=0;s<i;s++)e.append(t[s],ot()),mt.nextNode(),h.push({type:2,index:++o});e.append(t[i],ot())}}}else if(8===e.nodeType)if(e.data===it)h.push({type:2,index:o});else{let t=-1;for(;-1!==(t=e.data.indexOf(tt,t+1));)h.push({type:7,index:o}),t+=tt.length-1}o++}}static createElement(t,i){const s=et.createElement("template");return s.innerHTML=t,s}}function bt(t,i,s=t,e){var o,n,r,h;if(i===pt)return i;let c=void 0!==e?null===(o=s.Σi)||void 0===o?void 0:o[e]:s.Σo;const l=nt(i)?void 0:i._$litDirective$;return(null==c?void 0:c.constructor)!==l&&(null===(n=null==c?void 0:c.O)||void 0===n||n.call(c,!1),void 0===l?c=void 0:(c=new l(t),c.T(t,s,e)),void 0!==e?(null!==(r=(h=s).Σi)&&void 0!==r?r:h.Σi=[])[e]=c:s.Σo=c),void 0!==c&&(i=bt(t,c.S(t,i.values),c,e)),i}class xt{constructor(t,i){this.l=[],this.N=void 0,this.D=t,this.M=i}u(t){var i;const{el:{content:s},parts:e}=this.D,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:et).importNode(s,!0);mt.currentNode=o;let n=mt.nextNode(),r=0,h=0,c=e[0];for(;void 0!==c;){if(r===c.index){let i;2===c.type?i=new St(n,n.nextSibling,this,t):1===c.type?i=new c.ctor(n,c.name,c.strings,this,t):6===c.type&&(i=new kt(n,this,t)),this.l.push(i),c=e[++h]}r!==(null==c?void 0:c.index)&&(n=mt.nextNode(),r++)}return o}v(t){let i=0;for(const s of this.l)void 0!==s&&(void 0!==s.strings?(s.I(t,s,i),i+=s.strings.length-2):s.I(t[i])),i++}}class St{constructor(t,i,s,e){this.type=2,this.N=void 0,this.A=t,this.B=i,this.M=s,this.options=e}setConnected(t){var i;null===(i=this.P)||void 0===i||i.call(this,t)}get parentNode(){return this.A.parentNode}get startNode(){return this.A}get endNode(){return this.B}I(t,i=this){t=bt(this,t,i),nt(t)?t===ft||null==t||""===t?(this.H!==ft&&this.R(),this.H=ft):t!==this.H&&t!==pt&&this.m(t):void 0!==t._$litType$?this._(t):void 0!==t.nodeType?this.$(t):(t=>{var i;return rt(t)||"function"==typeof(null===(i=t)||void 0===i?void 0:i[Symbol.iterator])})(t)?this.g(t):this.m(t)}k(t,i=this.B){return this.A.parentNode.insertBefore(t,i)}$(t){this.H!==t&&(this.R(),this.H=this.k(t))}m(t){const i=this.A.nextSibling;null!==i&&3===i.nodeType&&(null===this.B?null===i.nextSibling:i===this.B.previousSibling)?i.data=t:this.$(et.createTextNode(t)),this.H=t}_(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this.C(t):(void 0===e.el&&(e.el=yt.createElement(e.h,this.options)),e);if((null===(i=this.H)||void 0===i?void 0:i.D)===o)this.H.v(s);else{const t=new xt(o,this),i=t.u(this.options);t.v(s),this.$(i),this.H=t}}C(t){let i=wt.get(t.strings);return void 0===i&&wt.set(t.strings,i=new yt(t)),i}g(t){rt(this.H)||(this.H=[],this.R());const i=this.H;let s,e=0;for(const o of t)e===i.length?i.push(s=new St(this.k(ot()),this.k(ot()),this,this.options)):s=i[e],s.I(o),e++;e<i.length&&(this.R(s&&s.B.nextSibling,e),i.length=e)}R(t=this.A.nextSibling,i){var s;for(null===(s=this.P)||void 0===s||s.call(this,!1,!0,i);t&&t!==this.B;){const i=t.nextSibling;t.remove(),t=i}}}class zt{constructor(t,i,s,e,o){this.type=1,this.H=ft,this.N=void 0,this.V=void 0,this.element=t,this.name=i,this.M=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this.H=Array(s.length-1).fill(ft),this.strings=s):this.H=ft}get tagName(){return this.element.tagName}I(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=bt(this,t,i,0),n=!nt(t)||t!==this.H&&t!==pt,n&&(this.H=t);else{const e=t;let r,h;for(t=o[0],r=0;r<o.length-1;r++)h=bt(this,e[s+r],i,r),h===pt&&(h=this.H[r]),n||(n=!nt(h)||h!==this.H[r]),h===ft?t=ft:t!==ft&&(t+=(null!=h?h:"")+o[r+1]),this.H[r]=h}n&&!e&&this.W(t)}W(t){t===ft?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class Ct extends zt{constructor(){super(...arguments),this.type=3}W(t){this.element[this.name]=t===ft?void 0:t}}class $t extends zt{constructor(){super(...arguments),this.type=4}W(t){t&&t!==ft?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name)}}class _t extends zt{constructor(){super(...arguments),this.type=5}I(t,i=this){var s;if((t=null!==(s=bt(this,t,i,0))&&void 0!==s?s:ft)===pt)return;const e=this.H,o=t===ft&&e!==ft||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==ft&&(e===ft||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this.H=t}handleEvent(t){var i,s;"function"==typeof this.H?this.H.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this.H.handleEvent(t)}}class kt{constructor(t,i,s){this.element=t,this.type=6,this.N=void 0,this.V=void 0,this.M=i,this.options=s}I(t){bt(this,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var Mt,Tt,At,Et,jt,Pt;null===(K=(Z=globalThis).litHtmlPlatformSupport)||void 0===K||K.call(Z,yt,St),(null!==(G=(Q=globalThis).litHtmlVersions)&&void 0!==G?G:Q.litHtmlVersions=[]).push("2.0.0-rc.3"),(null!==(Mt=(Pt=globalThis).litElementVersions)&&void 0!==Mt?Mt:Pt.litElementVersions=[]).push("3.0.0-rc.2");class Ot extends p{constructor(){super(...arguments),this.renderOptions={host:this},this.Φt=void 0}createRenderRoot(){var t,i;const s=super.createRenderRoot();return null!==(t=(i=this.renderOptions).renderBefore)&&void 0!==t||(i.renderBefore=s.firstChild),s}update(t){const i=this.render();super.update(t),this.Φt=((t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let r=n._$litPart$;if(void 0===r){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=r=new St(i.insertBefore(ot(),t),t,void 0,s)}return r.I(t),r})(i,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this.Φt)||void 0===t||t.setConnected(!1)}render(){return pt}}
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
function Ut(t,i,s,e){for(var o,n=arguments.length,r=n<3?i:null===e?e=Object.getOwnPropertyDescriptor(i,s):e,h=t.length-1;h>=0;h--)(o=t[h])&&(r=(n<3?o(r):n>3?o(i,s,r):o(i,s))||r);return n>3&&r&&Object.defineProperty(i,s,r),r
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
 */}Ot.finalized=!0,Ot._$litElement$=!0,null===(At=(Tt=globalThis).litElementHydrateSupport)||void 0===At||At.call(Tt,{LitElement:Ot}),null===(jt=(Et=globalThis).litElementPlatformSupport)||void 0===jt||jt.call(Et,{LitElement:Ot});const It="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,Nt=(t,i,s=null)=>{for(;i!==s;){const s=i.nextSibling;t.removeChild(i),i=s}},Rt=`{{lit-${String(Math.random()).slice(2)}}}`,Wt=`\x3c!--${Rt}--\x3e`,Lt=new RegExp(`${Rt}|${Wt}`);class Vt{constructor(t,i){this.parts=[],this.element=i;const s=[],e=[],o=document.createTreeWalker(i.content,133,null,!1);let n=0,r=-1,h=0;const{strings:c,values:{length:l}}=t;for(;h<l;){const t=o.nextNode();if(null!==t){if(r++,1===t.nodeType){if(t.hasAttributes()){const i=t.attributes,{length:s}=i;let e=0;for(let t=0;t<s;t++)qt(i[t].name,"$lit$")&&e++;for(;e-- >0;){const i=c[h],s=Jt.exec(i)[2],e=s.toLowerCase()+"$lit$",o=t.getAttribute(e);t.removeAttribute(e);const n=o.split(Lt);this.parts.push({type:"attribute",index:r,name:s,strings:n}),h+=n.length-1}}"TEMPLATE"===t.tagName&&(e.push(t),o.currentNode=t.content)}else if(3===t.nodeType){const i=t.data;if(i.indexOf(Rt)>=0){const e=t.parentNode,o=i.split(Lt),n=o.length-1;for(let i=0;i<n;i++){let s,n=o[i];if(""===n)s=Ht();else{const t=Jt.exec(n);null!==t&&qt(t[2],"$lit$")&&(n=n.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),s=document.createTextNode(n)}e.insertBefore(s,t),this.parts.push({type:"node",index:++r})}""===o[n]?(e.insertBefore(Ht(),t),s.push(t)):t.data=o[n],h+=n}}else if(8===t.nodeType)if(t.data===Rt){const i=t.parentNode;null!==t.previousSibling&&r!==n||(r++,i.insertBefore(Ht(),t)),n=r,this.parts.push({type:"node",index:r}),null===t.nextSibling?t.data="":(s.push(t),r--),h++}else{let i=-1;for(;-1!==(i=t.data.indexOf(Rt,i+1));)this.parts.push({type:"node",index:-1}),h++}}else o.currentNode=e.pop()}for(const t of s)t.parentNode.removeChild(t)}}const qt=(t,i)=>{const s=t.length-i.length;return s>=0&&t.slice(s)===i},Ft=t=>-1!==t.index,Ht=()=>document.createComment(""),Jt=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function Bt(t,i){const{element:{content:s},parts:e}=t,o=document.createTreeWalker(s,133,null,!1);let n=Zt(e),r=e[n],h=-1,c=0;const l=[];let a=null;for(;o.nextNode();){h++;const t=o.currentNode;for(t.previousSibling===a&&(a=null),i.has(t)&&(l.push(t),null===a&&(a=t)),null!==a&&c++;void 0!==r&&r.index===h;)r.index=null!==a?-1:r.index-c,n=Zt(e,n),r=e[n]}l.forEach((t=>t.parentNode.removeChild(t)))}const Dt=t=>{let i=11===t.nodeType?0:1;const s=document.createTreeWalker(t,133,null,!1);for(;s.nextNode();)i++;return i},Zt=(t,i=-1)=>{for(let s=i+1;s<t.length;s++){const i=t[s];if(Ft(i))return s}return-1};
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
const Kt=new WeakMap,Gt=t=>"function"==typeof t&&Kt.has(t),Qt={},Xt={};
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
class Yt{constructor(t,i,s){this.i=[],this.template=t,this.processor=i,this.options=s}update(t){let i=0;for(const s of this.i)void 0!==s&&s.setValue(t[i]),i++;for(const t of this.i)void 0!==t&&t.commit()}_clone(){const t=It?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),i=[],s=this.template.parts,e=document.createTreeWalker(t,133,null,!1);let o,n=0,r=0,h=e.nextNode();for(;n<s.length;)if(o=s[n],Ft(o)){for(;r<o.index;)r++,"TEMPLATE"===h.nodeName&&(i.push(h),e.currentNode=h.content),null===(h=e.nextNode())&&(e.currentNode=i.pop(),h=e.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(h.previousSibling),this.i.push(t)}else this.i.push(...this.processor.handleAttributeExpressions(h,o.name,o.strings,this.options));n++}else this.i.push(void 0),n++;return It&&(document.adoptNode(t),customElements.upgrade(t)),t}}
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
 */const ti=window.trustedTypes&&trustedTypes.createPolicy("lit-html",{createHTML:t=>t}),ii=` ${Rt} `;class si{constructor(t,i,s,e){this.strings=t,this.values=i,this.type=s,this.processor=e}getHTML(){const t=this.strings.length-1;let i="",s=!1;for(let e=0;e<t;e++){const t=this.strings[e],o=t.lastIndexOf("\x3c!--");s=(o>-1||s)&&-1===t.indexOf("--\x3e",o+1);const n=Jt.exec(t);i+=null===n?t+(s?ii:Wt):t.substr(0,n.index)+n[1]+n[2]+"$lit$"+n[3]+Rt}return i+=this.strings[t],i}getTemplateElement(){const t=document.createElement("template");let i=this.getHTML();return void 0!==ti&&(i=ti.createHTML(i)),t.innerHTML=i,t}}
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
 */const ei=t=>null===t||!("object"==typeof t||"function"==typeof t),oi=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class ni{constructor(t,i,s){this.dirty=!0,this.element=t,this.name=i,this.strings=s,this.parts=[];for(let t=0;t<s.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new ri(this)}_getValue(){const t=this.strings,i=t.length-1,s=this.parts;if(1===i&&""===t[0]&&""===t[1]){const t=s[0].value;if("symbol"==typeof t)return String(t);if("string"==typeof t||!oi(t))return t}let e="";for(let o=0;o<i;o++){e+=t[o];const i=s[o];if(void 0!==i){const t=i.value;if(ei(t)||!oi(t))e+="string"==typeof t?t:String(t);else for(const i of t)e+="string"==typeof i?i:String(i)}}return e+=t[i],e}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class ri{constructor(t){this.value=void 0,this.committer=t}setValue(t){t===Qt||ei(t)&&t===this.value||(this.value=t,Gt(t)||(this.committer.dirty=!0))}commit(){for(;Gt(this.value);){const t=this.value;this.value=Qt,t(this)}this.value!==Qt&&this.committer.commit()}}class hi{constructor(t){this.value=void 0,this.o=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(Ht()),this.endNode=t.appendChild(Ht())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.p(this.startNode=Ht()),t.p(this.endNode=Ht())}insertAfterPart(t){t.p(this.startNode=Ht()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.o=t}commit(){if(null===this.startNode.parentNode)return;for(;Gt(this.o);){const t=this.o;this.o=Qt,t(this)}const t=this.o;t!==Qt&&(ei(t)?t!==this.value&&this.j(t):t instanceof si?this.U(t):t instanceof Node?this.q(t):oi(t)?this.F(t):t===Xt?(this.value=Xt,this.clear()):this.j(t))}p(t){this.endNode.parentNode.insertBefore(t,this.endNode)}q(t){this.value!==t&&(this.clear(),this.p(t),this.value=t)}j(t){const i=this.startNode.nextSibling,s="string"==typeof(t=t??"")?t:String(t);i===this.endNode.previousSibling&&3===i.nodeType?i.data=s:this.q(document.createTextNode(s)),this.value=t}U(t){const i=this.options.templateFactory(t);if(this.value instanceof Yt&&this.value.template===i)this.value.update(t.values);else{const s=new Yt(i,t.processor,this.options),e=s._clone();s.update(t.values),this.q(e),this.value=s}}F(t){Array.isArray(this.value)||(this.value=[],this.clear());const i=this.value;let s,e=0;for(const o of t)s=i[e],void 0===s&&(s=new hi(this.options),i.push(s),0===e?s.appendIntoPart(this):s.insertAfterPart(i[e-1])),s.setValue(o),s.commit(),e++;e<i.length&&(i.length=e,this.clear(s&&s.endNode))}clear(t=this.startNode){Nt(this.startNode.parentNode,t.nextSibling,this.endNode)}}class ci{constructor(t,i,s){if(this.value=void 0,this.o=void 0,2!==s.length||""!==s[0]||""!==s[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=i,this.strings=s}setValue(t){this.o=t}commit(){for(;Gt(this.o);){const t=this.o;this.o=Qt,t(this)}if(this.o===Qt)return;const t=!!this.o;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.o=Qt}}class li extends ni{constructor(t,i,s){super(t,i,s),this.single=2===s.length&&""===s[0]&&""===s[1]}_createPart(){return new ai(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class ai extends ri{}let di=!1;(()=>{try{const t={get capture(){return di=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class ui{constructor(t,i,s){this.value=void 0,this.o=void 0,this.element=t,this.eventName=i,this.eventContext=s,this.J=t=>this.handleEvent(t)}setValue(t){this.o=t}commit(){for(;Gt(this.o);){const t=this.o;this.o=Qt,t(this)}if(this.o===Qt)return;const t=this.o,i=this.value,s=null==t||null!=i&&(t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive),e=null!=t&&(null==i||s);s&&this.element.removeEventListener(this.eventName,this.J,this.Z),e&&(this.Z=vi(t),this.element.addEventListener(this.eventName,this.J,this.Z)),this.value=t,this.o=Qt}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const vi=t=>t&&(di?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)
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
 */;function pi(t){let i=fi.get(t.type);void 0===i&&(i={stringsArray:new WeakMap,keyString:new Map},fi.set(t.type,i));let s=i.stringsArray.get(t.strings);if(void 0!==s)return s;const e=t.strings.join(Rt);return s=i.keyString.get(e),void 0===s&&(s=new Vt(t,t.getTemplateElement()),i.keyString.set(e,s)),i.stringsArray.set(t.strings,s),s}const fi=new Map,wi=new WeakMap;
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
 */const mi=new
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
class{handleAttributeExpressions(t,i,s,e){const o=i[0];if("."===o){return new li(t,i.slice(1),s).parts}if("@"===o)return[new ui(t,i.slice(1),e.eventContext)];if("?"===o)return[new ci(t,i.slice(1),s)];return new ni(t,i,s).parts}handleTextExpression(t){return new hi(t)}};
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
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.4.1");const gi=(t,...i)=>new si(t,i,"html",mi)
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
 */,yi=(t,i)=>`${t}--${i}`;let bi=!0;void 0===window.ShadyCSS?bi=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),bi=!1);const xi=t=>i=>{const s=yi(i.type,t);let e=fi.get(s);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},fi.set(s,e));let o=e.stringsArray.get(i.strings);if(void 0!==o)return o;const n=i.strings.join(Rt);if(o=e.keyString.get(n),void 0===o){const s=i.getTemplateElement();bi&&window.ShadyCSS.prepareTemplateDom(s,t),o=new Vt(i,s),e.keyString.set(n,o)}return e.stringsArray.set(i.strings,o),o},Si=["html","svg"],zi=new Set,Ci=(t,i,s)=>{zi.add(t);const e=s?s.element:document.createElement("template"),o=i.querySelectorAll("style"),{length:n}=o;if(0===n)return void window.ShadyCSS.prepareTemplateStyles(e,t);const r=document.createElement("style");for(let t=0;t<n;t++){const i=o[t];i.parentNode.removeChild(i),r.textContent+=i.textContent}(t=>{Si.forEach((i=>{const s=fi.get(yi(i,t));void 0!==s&&s.keyString.forEach((t=>{const{element:{content:i}}=t,s=new Set;Array.from(i.querySelectorAll("style")).forEach((t=>{s.add(t)})),Bt(t,s)}))}))})(t);const h=e.content;s?function(t,i,s=null){const{element:{content:e},parts:o}=t;if(null==s)return void e.appendChild(i);const n=document.createTreeWalker(e,133,null,!1);let r=Zt(o),h=0,c=-1;for(;n.nextNode();)for(c++,n.currentNode===s&&(h=Dt(i),s.parentNode.insertBefore(i,s));-1!==r&&o[r].index===c;){if(h>0){for(;-1!==r;)o[r].index+=h,r=Zt(o,r);return}r=Zt(o,r)}}(s,r,h.firstChild):h.insertBefore(r,h.firstChild),window.ShadyCSS.prepareTemplateStyles(e,t);const c=h.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==c)i.insertBefore(c.cloneNode(!0),i.firstChild);else if(s){h.insertBefore(r,h.firstChild);const t=new Set;t.add(r),Bt(s,t)}};window.JSCompiler_renameProperty=(t,i)=>t;const $i={toAttribute(t,i){switch(i){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){switch(i){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},_i=(t,i)=>i!==t&&(i==i||t==t),ki={attribute:!0,type:String,converter:$i,reflect:!1,hasChanged:_i};class Mi extends HTMLElement{constructor(){super(),this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach(((i,s)=>{const e=this._attributeNameForProperty(s,i);void 0!==e&&(this._attributeToPropertyMap.set(e,s),t.push(e))})),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach(((t,i)=>this._classProperties.set(i,t)))}}static createProperty(t,i=ki){if(this._ensureClassProperties(),this._classProperties.set(t,i),i.noAccessor||this.prototype.hasOwnProperty(t))return;const s="symbol"==typeof t?Symbol():`__${t}`,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e)}static getPropertyDescriptor(t,i,s){return{get(){return this[i]},set(e){const o=this[t];this[i]=e,this.requestUpdateInternal(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this._classProperties&&this._classProperties.get(t)||ki}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,i=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const s of i)this.createProperty(s,t[s])}}static _attributeNameForProperty(t,i){const s=i.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,i,s=_i){return s(t,i)}static _propertyValueFromAttribute(t,i){const s=i.type,e=i.converter||$i,o="function"==typeof e?e:e.fromAttribute;return o?o(t,s):t}static _propertyValueToAttribute(t,i){if(void 0===i.reflect)return;const s=i.type,e=i.converter;return(e&&e.toAttribute||$i.toAttribute)(t,s)}initialize(){this._updateState=0,this._updatePromise=new Promise((t=>this._enableUpdatingResolver=t)),this._changedProperties=new Map,this._saveInstanceProperties(),this.requestUpdateInternal()}_saveInstanceProperties(){this.constructor._classProperties.forEach(((t,i)=>{if(this.hasOwnProperty(i)){const t=this[i];delete this[i],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(i,t)}}))}_applyInstanceProperties(){this._instanceProperties.forEach(((t,i)=>this[i]=t)),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,i,s){i!==s&&this._attributeToProperty(t,s)}_propertyToAttribute(t,i,s=ki){const e=this.constructor,o=e._attributeNameForProperty(t,s);if(void 0!==o){const t=e._propertyValueToAttribute(i,s);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(o):this.setAttribute(o,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,i){if(8&this._updateState)return;const s=this.constructor,e=s._attributeToPropertyMap.get(t);if(void 0!==e){const t=s.getPropertyOptions(e);this._updateState=16|this._updateState,this[e]=s._propertyValueFromAttribute(i,t),this._updateState=-17&this._updateState}}requestUpdateInternal(t,i,s){let e=!0;if(void 0!==t){const o=this.constructor;s=s||o.getPropertyOptions(t),o._valueHasChanged(this[t],i,s.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,i),!0!==s.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,s))):e=!1}!this._hasRequestedUpdate&&e&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(t,i){return this.requestUpdateInternal(t,i),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(t){}const t=this.performUpdate();return null!=t&&await t,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){if(!this._hasRequestedUpdate)return;this._instanceProperties&&this._applyInstanceProperties();let t=!1;const i=this._changedProperties;try{t=this.shouldUpdate(i),t?this.update(i):this._markUpdated()}catch(i){throw t=!1,this._markUpdated(),i}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(i)),this.updated(i))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach(((t,i)=>this._propertyToAttribute(i,this[i],t))),this._reflectingProperties=void 0),this._markUpdated()}updated(t){}firstUpdated(t){}}Mi.finalized=!0;
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
const Ti=(t,i)=>"method"===i.kind&&i.descriptor&&!("value"in i.descriptor)?Object.assign(Object.assign({},i),{finisher(s){s.createProperty(i.key,t)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof i.initializer&&(this[i.key]=i.initializer.call(this))},finisher(s){s.createProperty(i.key,t)}};function Ai(t){return(i,s)=>void 0!==s?((t,i,s)=>{i.constructor.createProperty(s,t)})(t,i,s):Ti(t,i)}const Ei=(t,i,s)=>{Object.defineProperty(i,s,t)},ji=(t,i)=>({kind:"method",placement:"prototype",key:i.key,descriptor:t})
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/,Pi=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Oi=Symbol();class Ui{constructor(t,i){if(i!==Oi)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(Pi?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}
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
(window.litElementVersions||(window.litElementVersions=[])).push("2.5.1");const Ii={};class Ni extends Mi{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const t=this.getStyles();if(Array.isArray(t)){const i=(t,s)=>t.reduceRight(((t,s)=>Array.isArray(s)?i(s,t):(t.add(s),t)),s),s=i(t,new Set),e=[];s.forEach((t=>e.unshift(t))),this._styles=e}else this._styles=void 0===t?[]:[t];this._styles=this._styles.map((t=>{if(t instanceof CSSStyleSheet&&!Pi){const i=Array.prototype.slice.call(t.cssRules).reduce(((t,i)=>t+i.cssText),"");return new Ui(String(i),Oi)}return t}))}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow(this.constructor.shadowRootOptions)}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?Pi?this.renderRoot.adoptedStyleSheets=t.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map((t=>t.cssText)),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){const i=this.render();super.update(t),i!==Ii&&this.constructor.render(i,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach((t=>{const i=document.createElement("style");i.textContent=t.cssText,this.renderRoot.appendChild(i)})))}render(){return Ii}}Ni.finalized=!0,Ni.render=(t,i,s)=>{if(!s||"object"!=typeof s||!s.scopeName)throw new Error("The `scopeName` option is required.");const e=s.scopeName,o=wi.has(i),n=bi&&11===i.nodeType&&!!i.host,r=n&&!zi.has(e),h=r?document.createDocumentFragment():i;if(((t,i,s)=>{let e=wi.get(i);void 0===e&&(Nt(i,i.firstChild),wi.set(i,e=new hi(Object.assign({templateFactory:pi},s))),e.appendInto(i)),e.setValue(t),e.commit()})(t,h,Object.assign({templateFactory:xi(e)},s)),r){const t=wi.get(h);wi.delete(h);const s=t.value instanceof Yt?t.value.template:void 0;Ci(e,h,s),Nt(i,i.firstChild),i.appendChild(h),wi.set(i,t)}!o&&n&&window.ShadyCSS.styleElement(i.host)},Ni.shadowRootOptions={mode:"open"};const Ri=new Set;new MutationObserver((()=>{const t="rtl"===document.documentElement.dir?document.documentElement.dir:"ltr";Ri.forEach((i=>{i.setAttribute("dir",t)}))})).observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});class Wi extends(function(t){class i extends t{constructor(){super(...arguments),this.dir="ltr"}get isLTR(){return"ltr"===this.dir}connectedCallback(){if(!this.hasAttribute("dir")){let i=this.assignedSlot||this.parentNode;for(;i!==document.documentElement&&(void 0===(t=i).startManagingContentDirection&&"SP-THEME"!==t.tagName);)i=i.assignedSlot||i.parentNode||i.host;if(this.dir="rtl"===i.dir?i.dir:this.dir||"ltr",i===document.documentElement)Ri.add(this);else{const{localName:t}=i;t.search("-")>-1&&!customElements.get(t)?customElements.whenDefined(t).then((()=>{i.startManagingContentDirection(this)})):i.startManagingContentDirection(this)}this._dirParent=i}var t;super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._dirParent&&(this._dirParent===document.documentElement?Ri.delete(this):this._dirParent.stopManagingContentDirection(this),this.removeAttribute("dir"))}}return Ut([Ai({reflect:!0})],i.prototype,"dir",void 0),i}(Ni)){}
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
 */const Li=new WeakMap,Vi=(t=>(...i)=>{const s=t(...i);return Kt.set(s,!0),s})((t=>i=>{const s=Li.get(i);if(void 0===t&&i instanceof ri){if(void 0!==s||!Li.has(i)){const t=i.committer.name;i.committer.element.removeAttribute(t)}}else t!==s&&i.setValue(t);Li.set(i,t)}));class qi{constructor(){this.iconsetMap=new Map}static getInstance(){return qi.instance||(qi.instance=new qi),qi.instance}addIconset(t,i){this.iconsetMap.set(t,i);const s=new CustomEvent("sp-iconset-added",{bubbles:!0,composed:!0,detail:{name:t,iconset:i}});setTimeout((()=>window.dispatchEvent(s)),0)}removeIconset(t){this.iconsetMap.delete(t);const i=new CustomEvent("sp-iconset-removed",{bubbles:!0,composed:!0,detail:{name:t}});setTimeout((()=>window.dispatchEvent(i)),0)}getIconset(t){return this.iconsetMap.get(t)}}const Fi=((t,...i)=>{const s=i.reduce(((i,s,e)=>i+(t=>{if(t instanceof Ui)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(s)+t[e+1]),t[0]);return new Ui(s,Oi)})`
:host{display:inline-block;color:inherit;fill:currentColor;pointer-events:none}:host(:not(:root)){overflow:hidden}@media (forced-colors:active){.spectrum-UIIcon,:host{forced-color-adjust:auto}}:host{--spectrum-icon-size-s:var(--spectrum-alias-workflow-icon-size-s,var(--spectrum-global-dimension-size-200));--spectrum-icon-size-m:var(--spectrum-alias-workflow-icon-size-m,var(--spectrum-global-dimension-size-225));--spectrum-icon-size-l:var(--spectrum-alias-workflow-icon-size-l);--spectrum-icon-size-xl:var(--spectrum-alias-workflow-icon-size-xl,var(--spectrum-global-dimension-size-275));--spectrum-icon-size-xxl:var(--spectrum-global-dimension-size-400)}:host([size=s]){height:var(--spectrum-icon-size-s);width:var(--spectrum-icon-size-s)}:host([size=m]){height:var(--spectrum-icon-size-m);width:var(--spectrum-icon-size-m)}:host([size=l]){height:var(--spectrum-icon-size-l);width:var(--spectrum-icon-size-l)}:host([size=xl]){height:var(--spectrum-icon-size-xl);width:var(--spectrum-icon-size-xl)}:host([size=xxl]){height:var(--spectrum-icon-size-xxl);width:var(--spectrum-icon-size-xxl)}:host{height:var(--spectrum-icon-tshirt-size-height,var(--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)));width:var(--spectrum-icon-tshirt-size-width,var(--spectrum-alias-workflow-icon-size,var(--spectrum-global-dimension-size-225)))}#container{height:100%}::slotted(*),img,svg{height:100%;width:100%;vertical-align:top}
`;class Hi extends Wi{static get styles(){return[Fi]}render(){return gi`
            <slot></slot>
        `}}Ut([Ai()],Hi.prototype,"label",void 0),Ut([Ai({reflect:!0})],Hi.prototype,"size",void 0);class Ji extends Hi{constructor(){super(...arguments),this.iconsetListener=t=>{if(!this.name)return;const i=this.parseIcon(this.name);t.detail.name===i.iconset&&(this.updateIconPromise=this.updateIcon())}}connectedCallback(){super.connectedCallback(),window.addEventListener("sp-iconset-added",this.iconsetListener)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sp-iconset-added",this.iconsetListener)}firstUpdated(){this.updateIconPromise=this.updateIcon()}attributeChangedCallback(t,i,s){super.attributeChangedCallback(t,i,s),this.updateIconPromise=this.updateIcon()}render(){return this.name?gi`
                <div id="container"></div>
            `:this.src?gi`
                <img src="${this.src}" alt=${Vi(this.label)} />
            `:super.render()}async updateIcon(){if(!this.name)return Promise.resolve();const t=this.parseIcon(this.name),i=qi.getInstance().getIconset(t.iconset);return i&&this.iconContainer?(this.iconContainer.innerHTML="",i.applyIconToElement(this.iconContainer,t.icon,this.size||"",this.label?this.label:"")):Promise.resolve()}parseIcon(t){const i=t.split(":");let s="default",e=t;return i.length>1&&(s=i[0],e=i[1]),{iconset:s,icon:e}}async _getUpdateComplete(){await super._getUpdateComplete(),await this.updateIconPromise}}var Bi,Di;Ut([Ai()],Ji.prototype,"src",void 0),Ut([Ai()],Ji.prototype,"name",void 0),Ut([(Bi="#container",(t,i)=>{const s={get(){return this.renderRoot.querySelector(Bi)},enumerable:!0,configurable:!0};if(Di){const e=void 0!==i?i:t.key,o="symbol"==typeof e?Symbol():`__${e}`;s.get=function(){return void 0===this[o]&&(this[o]=this.renderRoot.querySelector(Bi)),this[o]}}return void 0!==i?Ei(s,t,i):ji(s,t)})],Ji.prototype,"iconContainer",void 0);class Zi extends Ji{constructor(){super()}static get styles(){return[super.styles||[],n`:host {
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
            
            :host([color="blue"])       { --ewc-alias-icon-color: var(--ewc-color-blue) }
            :host([color="celery"])     { --ewc-alias-icon-color: var(--ewc-color-celery) }
            :host([color="error"])      { --ewc-alias-icon-color: var(--ewc-color-error) }
            :host([color="fuchsia"])    { --ewc-alias-icon-color: var(--ewc-color-fuchsia) }
            :host([color="green"])      { --ewc-alias-icon-color: var(--ewc-color-green) }
            :host([color="indigo"])     { --ewc-alias-icon-color: var(--ewc-color-indigo) }
            :host([color="lime"])       { --ewc-alias-icon-color: var(--ewc-color-lime) }
            :host([color="magenta"])    { --ewc-alias-icon-color: var(--ewc-color-magenta) }
            :host([color="orange"])     { --ewc-alias-icon-color: var(--ewc-color-orange) }
            :host([color="primary"])    { --ewc-alias-icon-color: var(--ewc-color-primary) }
            :host([color="purple"])     { --ewc-alias-icon-color: var(--ewc-color-purple) }
            :host([color="secondary"])  { --ewc-alias-icon-color: var(--ewc-color-secondary) }
            :host([color="success"])    { --ewc-alias-icon-color: var(--ewc-color-success) }
            :host([color="teal"])       { --ewc-alias-icon-color: var(--ewc-color-teal) }
            :host([color="warning"])    { --ewc-alias-icon-color: var(--ewc-color-warning) }
            :host([color="yellow"])     { --ewc-alias-icon-color: var(--ewc-color-yellow) }

            :host(:is([padding="s"],[size="s"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-s) }
            :host(:is([padding="m"],[size="m"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-m) }
            :host(:is([padding="l"],[size="l"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-l) }
            :host(:is([padding="xl"],[size="xl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xl) }
            :host(:is([padding="xxl"],[size="xxl"]:not([padding]))) { --ewc-alias-icon-padding: var(--ewc-icon-padding-xxl) }

            :host([circular]) { border-radius: 100%; }`]}}customElements.define("e-icon",Zi);export{Zi as EIcon};
