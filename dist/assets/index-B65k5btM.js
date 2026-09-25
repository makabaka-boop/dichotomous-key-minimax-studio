(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const I=globalThis,W=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),se=new WeakMap;let $e=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(W&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=se.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&se.set(t,e))}return e}toString(){return this.cssText}};const we=i=>new $e(typeof i=="string"?i:i+"",void 0,G),D=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new $e(t,i,G)},Se=(i,e)=>{if(W)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=I.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},re=W?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return we(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ee,defineProperty:xe,getOwnPropertyDescriptor:ke,getOwnPropertyNames:Ce,getOwnPropertySymbols:Ne,getPrototypeOf:Pe}=Object,R=globalThis,ie=R.trustedTypes,Oe=ie?ie.emptyScript:"",Ue=R.reactiveElementPolyfillSupport,C=(i,e)=>i,V={toAttribute(i,e){switch(e){case Boolean:i=i?Oe:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},ge=(i,e)=>!Ee(i,e),oe={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ge};Symbol.metadata??=Symbol("metadata"),R.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&xe(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:o}=ke(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){const c=r?.call(this);o?.call(this,n),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;const e=Pe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){const t=this.properties,s=[...Ce(t),...Ne(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(re(r))}else e!==void 0&&t.push(re(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Se(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const o=(s.converter?.toAttribute!==void 0?s.converter:V).toAttribute(t,s.type);this._$Em=e,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:V;this._$Em=r;const c=n.fromAttribute(t,o.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(e,t,s,r=!1,o){if(e!==void 0){const n=this.constructor;if(r===!1&&(o=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??ge)(o,t)||s.useDefault&&s.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,o]of s){const{wrapped:n}=o,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,o,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[C("elementProperties")]=new Map,A[C("finalized")]=new Map,Ue?.({ReactiveElement:A}),(R.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z=globalThis,ne=i=>i,T=Z.trustedTypes,ae=T?T.createPolicy("lit-html",{createHTML:i=>i}):void 0,be="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+g,Me=`<${ye}>`,v=document,N=()=>v.createComment(""),P=i=>i===null||typeof i!="object"&&typeof i!="function",J=Array.isArray,He=i=>J(i)||typeof i?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ce=/-->/g,le=/>/g,b=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),he=/'/g,de=/"/g,ve=/^(?:script|style|textarea|title)$/i,Ie=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),d=Ie(1),S=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),ue=new WeakMap,y=v.createTreeWalker(v,129);function _e(i,e){if(!J(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return ae!==void 0?ae.createHTML(e):e}const Te=(i,e)=>{const t=i.length-1,s=[];let r,o=e===2?"<svg>":e===3?"<math>":"",n=x;for(let c=0;c<t;c++){const a=i[c];let h,u,l=-1,p=0;for(;p<a.length&&(n.lastIndex=p,u=n.exec(a),u!==null);)p=n.lastIndex,n===x?u[1]==="!--"?n=ce:u[1]!==void 0?n=le:u[2]!==void 0?(ve.test(u[2])&&(r=RegExp("</"+u[2],"g")),n=b):u[3]!==void 0&&(n=b):n===b?u[0]===">"?(n=r??x,l=-1):u[1]===void 0?l=-2:(l=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?b:u[3]==='"'?de:he):n===de||n===he?n=b:n===ce||n===le?n=x:(n=b,r=void 0);const m=n===b&&i[c+1].startsWith("/>")?" ":"";o+=n===x?a+Me:l>=0?(s.push(h),a.slice(0,l)+be+a.slice(l)+g+m):a+g+(l===-2?c:m)}return[_e(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class O{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let o=0,n=0;const c=e.length-1,a=this.parts,[h,u]=Te(e,t);if(this.el=O.createElement(h,s),y.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=y.nextNode())!==null&&a.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const l of r.getAttributeNames())if(l.endsWith(be)){const p=u[n++],m=r.getAttribute(l).split(g),$=/([.?@])?(.*)/.exec(p);a.push({type:1,index:o,name:$[2],strings:m,ctor:$[1]==="."?Re:$[1]==="?"?Le:$[1]==="@"?ze:L}),r.removeAttribute(l)}else l.startsWith(g)&&(a.push({type:6,index:o}),r.removeAttribute(l));if(ve.test(r.tagName)){const l=r.textContent.split(g),p=l.length-1;if(p>0){r.textContent=T?T.emptyScript:"";for(let m=0;m<p;m++)r.append(l[m],N()),y.nextNode(),a.push({type:2,index:++o});r.append(l[p],N())}}}else if(r.nodeType===8)if(r.data===ye)a.push({type:2,index:o});else{let l=-1;for(;(l=r.data.indexOf(g,l+1))!==-1;)a.push({type:7,index:o}),l+=g.length-1}o++}}static createElement(e,t){const s=v.createElement("template");return s.innerHTML=e,s}}function E(i,e,t=i,s){if(e===S)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const o=P(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=E(i,r._$AS(i,e.values),r,s)),e}class De{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??v).importNode(t,!0);y.currentNode=r;let o=y.nextNode(),n=0,c=0,a=s[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new H(o,o.nextSibling,this,e):a.type===1?h=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(h=new Ke(o,this,e)),this._$AV.push(h),a=s[++c]}n!==a?.index&&(o=y.nextNode(),n++)}return y.currentNode=v,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class H{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),P(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):He(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==f&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(v.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=O.createElement(_e(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const o=new De(r,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=ue.get(e.strings);return t===void 0&&ue.set(e.strings,t=new O(e)),t}k(e){J(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const o of e)r===t.length?t.push(s=new H(this.O(N()),this.O(N()),this,this.options)):s=t[r],s._$AI(o),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=ne(e).nextSibling;ne(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class L{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,o){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=f}_$AI(e,t=this,s,r){const o=this.strings;let n=!1;if(o===void 0)e=E(this,e,t,0),n=!P(e)||e!==this._$AH&&e!==S,n&&(this._$AH=e);else{const c=e;let a,h;for(e=o[0],a=0;a<o.length-1;a++)h=E(this,c[s+a],t,a),h===S&&(h=this._$AH[a]),n||=!P(h)||h!==this._$AH[a],h===f?e=f:e!==f&&(e+=(h??"")+o[a+1]),this._$AH[a]=h}n&&!r&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Re extends L{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}}class Le extends L{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==f)}}class ze extends L{constructor(e,t,s,r,o){super(e,t,s,r,o),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??f)===S)return;const s=this._$AH,r=e===f&&s!==f||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==f&&(s===f||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ke{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}}const Be=Z.litHtmlPolyfillSupport;Be?.(O,H),(Z.litHtmlVersions??=[]).push("3.3.3");const qe=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const o=t?.renderBefore??null;s._$litPart$=r=new H(e.insertBefore(N(),o),o,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const X=globalThis;class w extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=qe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}}w._$litElement$=!0,w.finalized=!0,X.litElementHydrateSupport?.({LitElement:w});const Fe=X.litElementPolyfillSupport;Fe?.({LitElement:w});(X.litElementVersions??=[]).push("4.2.2");const Q=3,U=16,Y=2,M=16;function k(i,e){const t=Math.min(i.length,e.length);for(let s=0;s<t;s++){const r=i.charCodeAt(s)-e.charCodeAt(s);if(r!==0)return r<0?-1:1}return i.length===e.length?0:i.length<e.length?-1:1}function pe(i){if(i.length===0||i.length>64)return!1;for(let e=0;e<i.length;e++)if(i.charCodeAt(e)>127)return!1;return!0}function je(i){const e=[];(i.species.length<Q||i.species.length>U)&&e.push(`species-count:${i.species.length}`),(i.features.length<Y||i.features.length>M)&&e.push(`feature-count:${i.features.length}`);const t=new Set;for(const o of i.species)pe(o)||e.push(`species-name:${o}`),t.has(o)&&e.push(`species-duplicate:${o}`),t.add(o);const s=new Set;for(const o of i.features)pe(o)||e.push(`feature-name:${o}`),s.has(o)&&e.push(`feature-duplicate:${o}`),s.add(o);i.matrix.length!==i.species.length&&e.push(`matrix-rows:${i.matrix.length}`);const r=Math.min(i.matrix.length,i.species.length);for(let o=0;o<r;o++){const n=i.matrix[o];if(n.length!==i.features.length){e.push(`matrix-cols:${o}:${n.length}`);continue}for(let c=0;c<n.length;c++)typeof n[c]!="boolean"&&e.push(`matrix-value:${o}:${c}`)}return e}function Ve(i){let e="";for(const t of i)e+=t?"1":"0";return e}function We(i){const e=new Map;for(let s=0;s<i.species.length;s++){const r=Ve(i.matrix[s]),o=e.get(r);o?o.push(s):e.set(r,[s])}let t=null;for(const s of e.values()){if(s.length<2)continue;const r=s.map(n=>i.species[n]).sort(k),o=[r[0],r[1]];(t===null||k(o[0],t[0])<0||k(o[0],t[0])===0&&k(o[1],t[1])<0)&&(t=o)}return t}function Ge(i){let e=0;for(;i!==0;)i&=i-1,e++;return e}function Ze(i){const e=je(i);if(e.length>0)return{status:"INVALID",errors:e};const t=We(i);if(t!==null)return{status:"INDISTINGUISHABLE",pair:t};const s=i.species.length,r=i.features.map((a,h)=>h).sort((a,h)=>k(i.features[a],i.features[h])),o=new Map;function n(a){const h=o.get(a);if(h!==void 0)return h;const u=Ge(a);let l;if(u===1){const p=31-Math.clz32(a);l={worst:0,total:0,node:{kind:"leaf",species:i.species[p]}}}else{let p=null;for(const m of r){let $=0,z=0;for(let _=0;_<s;_++)a&1<<_&&(i.matrix[_][m]?$|=1<<_:z|=1<<_);if($===0||z===0)continue;const K=n($),B=n(z),q=1+Math.max(K.worst,B.worst),te=u+K.total+B.total;(p===null||q<p.worst||q===p.worst&&te<p.total)&&(p={worst:q,total:te,node:{kind:"question",feature:i.features[m],yes:K.node,no:B.node}})}if(p===null)throw new Error(`no splitting feature for mask ${a}`);l=p}return o.set(a,l),l}const c=n((1<<s)-1);return{status:"OK",tree:c.node,worstDepth:c.worst,totalDepth:c.total}}function fe(i,e){let t=i;for(const s of e){if(t.kind!=="question")break;t=s?t.yes:t.no}return t}function Ae(i,e){const t=[];let s=i;for(const r of e){if(s.kind!=="question")break;t.push(s.feature),s=r?s.yes:s.no}return t}function Je(i,e,t){const s=Ae(e,t),r=new Map(i.features.map((o,n)=>[o,n]));return i.species.filter((o,n)=>{const c=i.matrix[n];for(let a=0;a<s.length;a++){const h=r.get(s[a]);if(h===void 0||c[h]!==t[a])return!1}return!0})}function j(i){return i.map(e=>e.slice())}function Xe(){return{species:["ant","bee","cat","dog","eel","fox"],features:["flying","furry","legs","swims","tail"],matrix:[[!1,!1,!0,!1,!1],[!0,!0,!0,!1,!1],[!1,!0,!0,!1,!0],[!1,!0,!0,!0,!0],[!1,!1,!1,!0,!1],[!1,!0,!0,!1,!1]]}}class Qe{constructor(e){this.listeners=new Set;const t=e??Xe();this.state={data:{species:t.species.slice(),features:t.features.slice(),matrix:j(t.matrix)},result:{status:"INVALID",errors:["not-solved-yet"]},answers:[],revision:0},this.recompute()}get snapshot(){return this.state}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(){for(const e of this.listeners)e()}recompute(){this.state={...this.state,result:Ze(this.state.data),answers:[],revision:this.state.revision+1}}setSpeciesName(e,t){if(e<0||e>=this.state.data.species.length)return;const s=this.state.data.species.slice();s[e]=t,this.state={...this.state,data:{...this.state.data,species:s}},this.recompute(),this.emit()}addSpecies(e){const t=this.state.data;if(t.species.length>=U)return;const s=t.species.concat([e??this.freshName("sp",t.species)]),r=t.matrix.map(o=>o.slice());r.push(t.features.map(()=>!1)),this.state={...this.state,data:{...t,species:s,matrix:r}},this.recompute(),this.emit()}removeSpecies(e){const t=this.state.data;if(e<0||e>=t.species.length)return;const s=t.species.filter((o,n)=>n!==e),r=t.matrix.filter((o,n)=>n!==e).map(o=>o.slice());this.state={...this.state,data:{...t,species:s,matrix:r}},this.recompute(),this.emit()}setFeatureName(e,t){if(e<0||e>=this.state.data.features.length)return;const s=this.state.data.features.slice();s[e]=t,this.state={...this.state,data:{...this.state.data,features:s}},this.recompute(),this.emit()}addFeature(e){const t=this.state.data;if(t.features.length>=M)return;const s=t.features.concat([e??this.freshName("f",t.features)]),r=t.matrix.map(o=>o.concat([!1]));this.state={...this.state,data:{...t,features:s,matrix:r}},this.recompute(),this.emit()}removeFeature(e){const t=this.state.data;if(e<0||e>=t.features.length)return;const s=t.features.filter((o,n)=>n!==e),r=t.matrix.map(o=>o.filter((n,c)=>c!==e));this.state={...this.state,data:{...t,features:s,matrix:r}},this.recompute(),this.emit()}setCell(e,t,s){const r=this.state.data;if(e<0||e>=r.species.length||t<0||t>=r.features.length)return;const o=j(r.matrix);o[e][t]=s,this.state={...this.state,data:{...r,matrix:o}},this.recompute(),this.emit()}toggleCell(e,t){const r=this.state.data.matrix[e]?.[t];typeof r=="boolean"&&this.setCell(e,t,!r)}loadData(e){this.state={...this.state,data:{species:e.species.slice(),features:e.features.slice(),matrix:j(e.matrix)}},this.recompute(),this.emit()}answer(e){this.state.result.status!=="OK"||fe(this.state.result.tree,this.state.answers).kind!=="question"||(this.state={...this.state,answers:this.state.answers.concat([e])},this.emit())}undo(){this.state.answers.length!==0&&(this.state={...this.state,answers:this.state.answers.slice(0,-1)},this.emit())}resetPath(){this.state.answers.length!==0&&(this.state={...this.state,answers:[]},this.emit())}currentNode(){return this.state.result.status!=="OK"?null:fe(this.state.result.tree,this.state.answers)}askedFeatures(){return this.state.result.status!=="OK"?[]:Ae(this.state.result.tree,this.state.answers)}candidates(){return this.state.result.status!=="OK"?[]:Je(this.state.data,this.state.result.tree,this.state.answers)}freshName(e,t){for(let s=1;;s++){const r=`${e}${s}`;if(!t.includes(r))return r}}}class ee extends w{static{this.properties={store:{attribute:!1}}}connectedCallback(){super.connectedCallback(),this.resubscribe()}disconnectedCallback(){this.unsub?.(),this.unsub=void 0,super.disconnectedCallback()}willUpdate(e){e.has("store")&&this.resubscribe()}resubscribe(){this.unsub?.(),this.unsub=this.store?.subscribe(()=>this.requestUpdate())}}function Ye(i){const[e,...t]=i.split(":");switch(e){case"species-count":return`物种数量须为 ${Q}–${U}，当前为 ${t[0]}`;case"feature-count":return`特征数量须为 ${Y}–${M}，当前为 ${t[0]}`;case"species-name":return`物种名「${t[0]}」为空或含非 ASCII 字符`;case"species-duplicate":return`物种名「${t[0]}」重复`;case"feature-name":return`特征名「${t[0]}」为空或含非 ASCII 字符`;case"feature-duplicate":return`特征名「${t[0]}」重复`;case"matrix-rows":return`矩阵行数（${t[0]}）与物种数不一致`;case"matrix-cols":return`矩阵第 ${Number(t[0])+1} 行列数（${t[1]}）与特征数不一致`;case"matrix-value":return`矩阵 (${t[0]}, ${t[1]}) 不是布尔值`;default:return i}}class et extends ee{static{this.styles=D`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    section {
      margin-bottom: 1.25rem;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 0.2rem 0.4rem;
    }
    .chip input {
      width: 7rem;
      background: transparent;
      border: none;
      color: #e2e8f0;
      font: inherit;
      outline: none;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 0.4rem;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      padding: 0.2rem 0.6rem;
    }
    button:hover:not(:disabled) {
      background: #1e293b;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .remove {
      padding: 0 0.4rem;
      color: #f87171;
    }
    table {
      border-collapse: collapse;
    }
    th,
    td {
      padding: 0.25rem 0.4rem;
      text-align: center;
    }
    th {
      color: #93c5fd;
      font-weight: 600;
      writing-mode: vertical-rl;
      max-height: 7rem;
    }
    td.rowhead {
      color: #cbd5f5;
      text-align: right;
      font-family: ui-monospace, monospace;
    }
    td button.cell {
      width: 1.9rem;
      height: 1.9rem;
      padding: 0;
      font-family: ui-monospace, monospace;
    }
    td button.cell.on {
      background: #166534;
      border-color: #22c55e;
      color: #dcfce7;
    }
    td button.cell.off {
      background: #1f2937;
      color: #64748b;
    }
    .status {
      border-radius: 0.5rem;
      padding: 0.6rem 0.8rem;
      margin-top: 0.5rem;
    }
    .status.ok {
      background: #052e16;
      border: 1px solid #16a34a;
      color: #bbf7d0;
    }
    .status.warn {
      background: #2a1604;
      border: 1px solid #d97706;
      color: #fde68a;
    }
    .status.bad {
      background: #2b0a0a;
      border: 1px solid #ef4444;
      color: #fecaca;
    }
    .status ul {
      margin: 0.3rem 0 0;
      padding-left: 1.2rem;
    }
    .hint {
      color: #64748b;
      font-size: 0.85rem;
    }
  `}render(){if(!this.store)return d``;const{data:e,result:t}=this.store.snapshot;return d`
      <section>
        <h2>物种（${e.species.length}/${U}）</h2>
        <div class="chips">
          ${e.species.map((s,r)=>d`
              <span class="chip">
                <input
                  aria-label="物种名"
                  .value=${s}
                  @input=${o=>this.store.setSpeciesName(r,o.target.value)}
                />
                <button
                  class="remove"
                  title="删除物种"
                  ?disabled=${e.species.length<=Q}
                  @click=${()=>this.store.removeSpecies(r)}
                >
                  ×
                </button>
              </span>
            `)}
          <button
            ?disabled=${e.species.length>=U}
            @click=${()=>this.store.addSpecies()}
          >
            + 物种
          </button>
        </div>
      </section>

      <section>
        <h2>二值特征（${e.features.length}/${M}）</h2>
        <div class="chips">
          ${e.features.map((s,r)=>d`
              <span class="chip">
                <input
                  aria-label="特征名"
                  .value=${s}
                  @input=${o=>this.store.setFeatureName(r,o.target.value)}
                />
                <button
                  class="remove"
                  title="删除特征"
                  ?disabled=${e.features.length<=Y}
                  @click=${()=>this.store.removeFeature(r)}
                >
                  ×
                </button>
              </span>
            `)}
          <button
            ?disabled=${e.features.length>=M}
            @click=${()=>this.store.addFeature()}
          >
            + 特征
          </button>
        </div>
      </section>

      <section>
        <h2>物种 × 特征矩阵</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              ${e.features.map(s=>d`<th title=${s}>${s}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${e.matrix.map((s,r)=>d`
                <tr>
                  <td class="rowhead">${e.species[r]}</td>
                  ${s.map((o,n)=>d`
                      <td>
                        <button
                          class="cell ${o?"on":"off"}"
                          title="${e.species[r]} · ${e.features[n]}"
                          @click=${()=>this.store.toggleCell(r,n)}
                        >
                          ${o?"1":"0"}
                        </button>
                      </td>
                    `)}
                </tr>
              `)}
          </tbody>
        </table>
        <p class="hint">点击格子切换 0/1；任何修改都会立即使旧决策树失效并重新求解。</p>
      </section>

      <section>${this.renderStatus(t)}</section>
    `}renderStatus(e){if(e.status==="OK"){const t=this.store.snapshot.data.species.length,s=(e.totalDepth/t).toFixed(2);return d`
        <div class="status ok">
          决策树已生成：最坏提问数 <b>${e.worstDepth}</b>，路径长度总和
          <b>${e.totalDepth}</b>（平均 ${s} 问 / 物种）。
        </div>
      `}return e.status==="INDISTINGUISHABLE"?d`
        <div class="status warn">
          <b>INDISTINGUISHABLE</b>：物种 <code>${e.pair[0]}</code> 与
          <code>${e.pair[1]}</code>
          的特征向量完全相同，任何提问都无法区分它们，故不生成决策树。
        </div>
      `:d`
      <div class="status bad">
        数据无效，无法求解：
        <ul>
          ${e.errors.map(t=>d`<li>${Ye(t)}</li>`)}
        </ul>
      </div>
    `}}customElements.define("key-editor",et);class tt extends ee{static{this.styles=D`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    .panel {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 0.6rem;
      padding: 0.9rem;
    }
    .question {
      font-size: 1.15rem;
      margin: 0.2rem 0 0.7rem;
    }
    .question code {
      color: #fbbf24;
    }
    .answers {
      display: flex;
      gap: 0.6rem;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 0.4rem;
      border: 1px solid #475569;
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.35rem 1.1rem;
    }
    button:hover:not(:disabled) {
      background: #334155;
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    button.yes {
      border-color: #22c55e;
    }
    button.no {
      border-color: #f87171;
    }
    .leaf {
      font-size: 1.15rem;
      color: #86efac;
    }
    .leaf code {
      font-size: 1.3rem;
    }
    .toolbar {
      margin-top: 0.7rem;
      display: flex;
      gap: 0.5rem;
    }
    .crumbs {
      margin-top: 0.7rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .crumb {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 999px;
      padding: 0.1rem 0.6rem;
      font-size: 0.85rem;
      color: #cbd5f5;
    }
    .crumb b {
      color: #fbbf24;
    }
    .candidates {
      margin-top: 0.7rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .candidates code {
      color: #e2e8f0;
      margin-right: 0.3rem;
    }
    .meta {
      color: #64748b;
      font-size: 0.85rem;
    }
    .warn {
      background: #2a1604;
      border: 1px solid #d97706;
      color: #fde68a;
      border-radius: 0.5rem;
      padding: 0.6rem 0.8rem;
    }
  `}render(){if(!this.store)return d``;const e=this.store.snapshot;if(e.result.status==="INDISTINGUISHABLE")return d`
        <h2>识别</h2>
        <div class="warn">
          当前矩阵存在无法区分的物种对（${e.result.pair[0]} /
          ${e.result.pair[1]}），请先修正矩阵再开始识别。
        </div>
      `;if(e.result.status!=="OK")return d`<h2>识别</h2>
        <div class="warn">数据无效，修正后才能生成检索树。</div>`;const t=this.store.currentNode(),s=this.store.askedFeatures(),r=this.store.candidates(),o=e.answers.length;return d`
      <h2>识别</h2>
      <div class="panel">
        <div class="meta">
          已问 ${o} 题 · 最坏还需 ${e.result.worstDepth} 题封顶 · 候选
          ${r.length} 个
        </div>
        ${t&&t.kind==="question"?d`
              <p class="question">该样本具有特征 <code>${t.feature}</code> 吗？</p>
              <div class="answers">
                <button class="yes" @click=${()=>this.store.answer(!0)}>是</button>
                <button class="no" @click=${()=>this.store.answer(!1)}>否</button>
              </div>
            `:d`
              <p class="leaf">
                识别结果：<code>${t&&t.kind==="leaf"?t.species:"?"}</code>
              </p>
            `}
        <div class="toolbar">
          <button ?disabled=${o===0} @click=${()=>this.store.undo()}>← 回溯</button>
          <button ?disabled=${o===0} @click=${()=>this.store.resetPath()}>重来</button>
        </div>
        ${s.length>0?d`
              <div class="crumbs">
                ${s.map((n,c)=>d`
                    <span class="crumb">${n}：<b>${e.answers[c]?"是":"否"}</b></span>
                  `)}
              </div>
            `:f}
        <div class="candidates">
          剩余候选：${r.map(n=>d`<code>${n}</code>`)}
        </div>
      </div>
    `}}customElements.define("key-identify",tt);class st extends ee{static{this.styles=D`
    :host {
      display: block;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
      color: #7dd3fc;
    }
    .tree {
      font-family: ui-monospace, monospace;
      font-size: 0.9rem;
      overflow-x: auto;
      padding: 0.6rem;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 0.6rem;
    }
    ul {
      list-style: none;
      margin: 0;
      padding-left: 1.4rem;
    }
    .node {
      display: inline-block;
      padding: 0.1rem 0.3rem;
      border-radius: 0.3rem;
      white-space: nowrap;
    }
    .node.current {
      background: #1e3a8a;
      color: #bfdbfe;
    }
    .q {
      color: #fbbf24;
    }
    .branch {
      color: #64748b;
    }
    .branch.yes {
      color: #4ade80;
    }
    .branch.no {
      color: #f87171;
    }
    .leaf {
      color: #86efac;
    }
    .empty {
      color: #64748b;
    }
  `}render(){if(!this.store)return d``;const e=this.store.snapshot;return e.result.status!=="OK"?d`<h2>决策树</h2>
        <div class="tree"><span class="empty">（无可视化：决策树未生成）</span></div>`:d`
      <h2>决策树</h2>
      <div class="tree">${this.renderNode(e.result.tree,0,!0)}</div>
    `}renderNode(e,t,s){const r=this.store.snapshot.answers,o=s&&r.length===t;if(e.kind==="leaf")return d`<div class="node leaf ${o?"current":""}">→ ${e.species}</div>`;const n=s&&t<r.length?r[t]:void 0;return d`
      <div class="node ${o?"current":""}">
        <span class="q">? ${e.feature}</span>
      </div>
      <ul>
        <li>
          <span class="branch yes">是 ─</span>
          ${this.renderNode(e.yes,t+1,n===!0)}
        </li>
        <li>
          <span class="branch no">否 ─</span>
          ${this.renderNode(e.no,t+1,n===!1)}
        </li>
      </ul>
    `}}customElements.define("key-tree-view",st);function me(i){return i.replace(/^#\/?/,"").startsWith("key")?"key":"home"}class rt extends w{constructor(){super(...arguments),this.store=new Qe,this.route=me(window.location.hash),this.onHashChange=()=>{this.route=me(window.location.hash)}}static{this.properties={route:{state:!0}}}static{this.styles=D`
    :host {
      display: block;
      max-width: 1080px;
      margin: 0 auto;
      padding: 1.5rem 1rem 4rem;
    }
    header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.8rem;
      margin-bottom: 1.2rem;
    }
    h1 {
      font-size: 1.3rem;
      margin: 0;
      color: #e2e8f0;
    }
    nav a {
      color: #7dd3fc;
      text-decoration: none;
      margin-right: 0.8rem;
    }
    nav a.active {
      text-decoration: underline;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 900px) {
      .layout {
        grid-template-columns: 3fr 2fr;
      }
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.8rem;
      padding: 1rem;
    }
    .hero p {
      color: #94a3b8;
      line-height: 1.7;
    }
    .hero code {
      color: #fbbf24;
    }
  `}connectedCallback(){super.connectedCallback(),window.addEventListener("hashchange",this.onHashChange)}disconnectedCallback(){window.removeEventListener("hashchange",this.onHashChange),super.disconnectedCallback()}render(){return d`
      <header>
        <h1>二歧检索表 · Minimax Studio</h1>
        <nav>
          <a class=${this.route==="home"?"active":""} href="#/">首页</a>
          <a class=${this.route==="key"?"active":""} href="#/key">检索表编辑器</a>
        </nav>
      </header>
      ${this.route==="key"?this.renderKeyPage():this.renderHome()}
    `}renderHome(){return d`
      <div class="card hero">
        <p>
          交互式二歧检索表编辑器。输入 3–16 个唯一 ASCII 物种、2–16 个唯一 ASCII
          二值特征以及完整的物种×特征矩阵，求解器会为当前候选集合选择真正能分裂它的特征，
          生成<strong>最坏提问数最小</strong>的决策树；并列时依次按所有物种路径长度之和、
          特征 id 字节序裁决。
        </p>
        <p>
          若两个物种的特征向量完全相同，则返回 <code>INDISTINGUISHABLE</code>
          及字节序最小的物种对，绝不伪造识别树。编辑矩阵后旧树立即失效；
          识别面板支持沿是/否分支下行并随时回溯。
        </p>
        <p><a href="#/key">进入检索表编辑器 →</a></p>
      </div>
    `}renderKeyPage(){return d`
      <div class="layout">
        <div class="col card"><key-editor .store=${this.store}></key-editor></div>
        <div class="col">
          <div class="card"><key-identify .store=${this.store}></key-identify></div>
          <div class="card"><key-tree-view .store=${this.store}></key-tree-view></div>
        </div>
      </div>
    `}}customElements.define("key-app",rt);
