/**
 * @license
 * MIT License
 *
 * Copyright (c) 2026 js-vanilla
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */ var inflateRaw=(()=>{let _=Uint8Array,e=_.fromBase64?.bind(_)??(e=>{let l=atob(e),$=l.length,r=new _($);for(;$--;)r[$]=l.charCodeAt($);return r}),l=l=>{let $=e(l),r=4*$.length;r<32768&&(r=32768);let t=new _(r),a=0,f=e=>{let l=t.length,$=a+e;if($>l){do l=3*l>>>1;while(l<$);let r=new _(l);r.set(t),t=r}},s=new Uint16Array(66400),u=s.subarray(0,32768),b=s.subarray(32768,65536),n=s.subarray(65536,65856),i,o,y=new Int32Array(48),h=0,w=0,g=0,d=()=>{for(;w<16&&g<$.length;)h|=$[g++]<<w,w+=8},c=_=>{d();let e=h&(1<<_)-1;return h>>>=_,w-=_,e},F=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],k=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],m=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],v=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],x=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],A=y.subarray(0,16),B=y.subarray(16,32),C=(_,e)=>{let l=A.fill(0),$=0;for(let r=0;r<_.length;r++){let t=_[r];t>0&&(l[t]++,t>$&&($=t))}let a=1<<$,f=e.subarray(0,a),s=B,u=0;for(let b=1;b<=$;b++)s[b]=u,u+=l[b];let i=n;for(let o=0;o<_.length;o++)_[o]>0&&(i[s[_[o]]++]=o);let y=0,h=0;for(let w=1;w<=$;w++){let g=1<<w,d=l[w];for(let c=0;c<d;c++){let F=i[h++],k=w<<9|F;for(let m=y;m<a;m+=g)f[m]=k;let v=1<<w-1;for(;y&v;)y^=v,v>>=1;y^=v}}return f},R=_=>{d();let e=_.length-1,l=_[h&e],$=l>>>9;return h>>>=$,w-=$,511&l},j=new _(320),p=j.subarray(0,19),q=!1,z=0;for(;!z;){let D=c(3);z=1&D;let E=D>>1;if(0===E){h=w=0;let G=$[g++]|$[g++]<<8;g+=2,f(G),t.set($.subarray(g,g+G),a),a+=G,g+=G}else{let H,I;if(1===E){if(!q){q=!0;let J=65856,K=j.subarray(0,288);K.fill(8,0,144),K.fill(9,144,256),K.fill(7,256,280),K.fill(8,280,288),C(K,i=s.subarray(J,J+=512));let L=j.subarray(0,32).fill(5);C(L,o=s.subarray(J,J+=32))}H=i,I=o}else{let M=c(14),N=(31&M)+257,O=(M>>5&31)+1,P=(M>>10&15)+4;p.fill(0);for(let Q=0;Q<P;Q++)p[F[Q]]=c(3);let S=C(p,u),T=N+O,U=j.subarray(0,T).fill(0),V=0;for(;V<T;){let W=R(S);if(W<16)U[V++]=W;else{let X=0,Y=0;for(16===W?(X=3+c(2),Y=U[V-1]):X=17===W?3+c(3):11+c(7);X--;)U[V++]=Y}}H=C(U.subarray(0,N),u),I=C(U.subarray(N),b)}for(;;){let Z=R(H);if(Z<256)f(1),t[a++]=Z;else if(256===Z)break;else{let __=Z-257,_e=k[__]+c(m[__]),_l=R(I),_$=v[_l]+c(x[_l]);f(_e);let _r=a-_$;if(1===_$)t.fill(t[_r],a,a+=_e);else for(;_e>0;){let _t=a-_r;_e<_t&&(_t=_e),t.set(t.subarray(_r,_r+_t),a),a+=_t,_e-=_t}}}}}return new TextDecoder().decode(t.subarray(0,a))};return l})();