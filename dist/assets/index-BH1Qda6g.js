const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DulzCsgm.js","assets/index-BN5dEhzL.js","assets/index-Cs5oz2oJ.js","assets/index-ByYJGEzP.js","assets/index-CIkZs6Te.js","assets/index-BdXT-s3j.js","assets/index-YW5LWHLd.js","assets/index-PcpCrDXm.js","assets/index-BDAPDKU_.js"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();function Ue(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var U=Ue();function Tt(t){U=t}var re={exec:()=>null};function b(t,e=""){let s=typeof t=="string"?t:t.source;const r={replace:(n,i)=>{let a=typeof i=="string"?i:i.source;return a=a.replace(S.caret,"$1"),s=s.replace(n,a),r},getRegex:()=>new RegExp(s,e)};return r}var S={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}#`),htmlBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}<(?:[a-z].*>|!--)`,"i")},ns=/^(?:[ \t]*(?:\n|$))+/,rs=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,is=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,ce=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,as=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Ve=/(?:[*+-]|\d{1,9}[.)])/,Lt=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Rt=b(Lt).replace(/bull/g,Ve).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),os=b(Lt).replace(/bull/g,Ve).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Ge=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ls=/^[^\n]+/,Ze=/(?!\s*\])(?:\\.|[^\[\]\\])+/,cs=b(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Ze).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),us=b(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Ve).getRegex(),$e="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",We=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ds=b("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",We).replace("tag",$e).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),At=b(Ge).replace("hr",ce).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$e).getRegex(),ps=b(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",At).getRegex(),Ke={blockquote:ps,code:rs,def:cs,fences:is,heading:as,hr:ce,html:ds,lheading:Rt,list:us,newline:ns,paragraph:At,table:re,text:ls},nt=b("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",ce).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$e).getRegex(),hs={...Ke,lheading:os,table:nt,paragraph:b(Ge).replace("hr",ce).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",nt).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$e).getRegex()},ms={...Ke,html:b(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",We).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:re,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:b(Ge).replace("hr",ce).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Rt).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},fs=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,gs=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ct=/^( {2,}|\\)\n(?!\s*$)/,bs=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,ze=/[\p{P}\p{S}]/u,Je=/[\s\p{P}\p{S}]/u,Pt=/[^\s\p{P}\p{S}]/u,xs=b(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Je).getRegex(),It=/(?!~)[\p{P}\p{S}]/u,vs=/(?!~)[\s\p{P}\p{S}]/u,ws=/(?:[^\s\p{P}\p{S}]|~)/u,ys=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,Mt=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,ks=b(Mt,"u").replace(/punct/g,ze).getRegex(),_s=b(Mt,"u").replace(/punct/g,It).getRegex(),Nt="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Ss=b(Nt,"gu").replace(/notPunctSpace/g,Pt).replace(/punctSpace/g,Je).replace(/punct/g,ze).getRegex(),$s=b(Nt,"gu").replace(/notPunctSpace/g,ws).replace(/punctSpace/g,vs).replace(/punct/g,It).getRegex(),zs=b("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Pt).replace(/punctSpace/g,Je).replace(/punct/g,ze).getRegex(),Es=b(/\\(punct)/,"gu").replace(/punct/g,ze).getRegex(),Ts=b(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Ls=b(We).replace("(?:-->|$)","-->").getRegex(),Rs=b("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Ls).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ke=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,As=b(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",ke).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Dt=b(/^!?\[(label)\]\[(ref)\]/).replace("label",ke).replace("ref",Ze).getRegex(),jt=b(/^!?\[(ref)\](?:\[\])?/).replace("ref",Ze).getRegex(),Cs=b("reflink|nolink(?!\\()","g").replace("reflink",Dt).replace("nolink",jt).getRegex(),Qe={_backpedal:re,anyPunctuation:Es,autolink:Ts,blockSkip:ys,br:Ct,code:gs,del:re,emStrongLDelim:ks,emStrongRDelimAst:Ss,emStrongRDelimUnd:zs,escape:fs,link:As,nolink:jt,punctuation:xs,reflink:Dt,reflinkSearch:Cs,tag:Rs,text:bs,url:re},Ps={...Qe,link:b(/^!?\[(label)\]\((.*?)\)/).replace("label",ke).getRegex(),reflink:b(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ke).getRegex()},Ne={...Qe,emStrongRDelimAst:$s,emStrongLDelim:_s,url:b(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},Is={...Ne,br:b(Ct).replace("{2,}","*").getRegex(),text:b(Ne.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},de={normal:Ke,gfm:hs,pedantic:ms},X={normal:Qe,gfm:Ne,breaks:Is,pedantic:Ps},Ms={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},rt=t=>Ms[t];function C(t,e){if(e){if(S.escapeTest.test(t))return t.replace(S.escapeReplace,rt)}else if(S.escapeTestNoEncode.test(t))return t.replace(S.escapeReplaceNoEncode,rt);return t}function it(t){try{t=encodeURI(t).replace(S.percentDecode,"%")}catch{return null}return t}function at(t,e){const s=t.replace(S.findPipe,(i,a,o)=>{let c=!1,l=a;for(;--l>=0&&o[l]==="\\";)c=!c;return c?"|":" |"}),r=s.split(S.splitPipe);let n=0;if(r[0].trim()||r.shift(),r.length>0&&!r.at(-1)?.trim()&&r.pop(),e)if(r.length>e)r.splice(e);else for(;r.length<e;)r.push("");for(;n<r.length;n++)r[n]=r[n].trim().replace(S.slashPipe,"|");return r}function ee(t,e,s){const r=t.length;if(r===0)return"";let n=0;for(;n<r&&t.charAt(r-n-1)===e;)n++;return t.slice(0,r-n)}function Ns(t,e){if(t.indexOf(e[1])===-1)return-1;let s=0;for(let r=0;r<t.length;r++)if(t[r]==="\\")r++;else if(t[r]===e[0])s++;else if(t[r]===e[1]&&(s--,s<0))return r;return s>0?-2:-1}function ot(t,e,s,r,n){const i=e.href,a=e.title||null,o=t[1].replace(n.other.outputLinkReplace,"$1");r.state.inLink=!0;const c={type:t[0].charAt(0)==="!"?"image":"link",raw:s,href:i,title:a,text:o,tokens:r.inlineTokens(o)};return r.state.inLink=!1,c}function Ds(t,e,s){const r=t.match(s.other.indentCodeCompensation);if(r===null)return e;const n=r[1];return e.split(`
`).map(i=>{const a=i.match(s.other.beginningSpace);if(a===null)return i;const[o]=a;return o.length>=n.length?i.slice(n.length):i}).join(`
`)}var _e=class{options;rules;lexer;constructor(t){this.options=t||U}space(t){const e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){const e=this.rules.block.code.exec(t);if(e){const s=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?s:ee(s,`
`)}}}fences(t){const e=this.rules.block.fences.exec(t);if(e){const s=e[0],r=Ds(s,e[3]||"",this.rules);return{type:"code",raw:s,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:r}}}heading(t){const e=this.rules.block.heading.exec(t);if(e){let s=e[2].trim();if(this.rules.other.endingHash.test(s)){const r=ee(s,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(s=r.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:s,tokens:this.lexer.inline(s)}}}hr(t){const e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:ee(e[0],`
`)}}blockquote(t){const e=this.rules.block.blockquote.exec(t);if(e){let s=ee(e[0],`
`).split(`
`),r="",n="";const i=[];for(;s.length>0;){let a=!1;const o=[];let c;for(c=0;c<s.length;c++)if(this.rules.other.blockquoteStart.test(s[c]))o.push(s[c]),a=!0;else if(!a)o.push(s[c]);else break;s=s.slice(c);const l=o.join(`
`),u=l.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${l}`:l,n=n?`${n}
${u}`:u;const d=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,i,!0),this.lexer.state.top=d,s.length===0)break;const p=i.at(-1);if(p?.type==="code")break;if(p?.type==="blockquote"){const h=p,m=h.raw+`
`+s.join(`
`),f=this.blockquote(m);i[i.length-1]=f,r=r.substring(0,r.length-h.raw.length)+f.raw,n=n.substring(0,n.length-h.text.length)+f.text;break}else if(p?.type==="list"){const h=p,m=h.raw+`
`+s.join(`
`),f=this.list(m);i[i.length-1]=f,r=r.substring(0,r.length-p.raw.length)+f.raw,n=n.substring(0,n.length-h.raw.length)+f.raw,s=m.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:i,text:n}}}list(t){let e=this.rules.block.list.exec(t);if(e){let s=e[1].trim();const r=s.length>1,n={type:"list",raw:"",ordered:r,start:r?+s.slice(0,-1):"",loose:!1,items:[]};s=r?`\\d{1,9}\\${s.slice(-1)}`:`\\${s}`,this.options.pedantic&&(s=r?s:"[*+-]");const i=this.rules.other.listItemRegex(s);let a=!1;for(;t;){let c=!1,l="",u="";if(!(e=i.exec(t))||this.rules.block.hr.test(t))break;l=e[0],t=t.substring(l.length);let d=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,y=>" ".repeat(3*y.length)),p=t.split(`
`,1)[0],h=!d.trim(),m=0;if(this.options.pedantic?(m=2,u=d.trimStart()):h?m=e[1].length+1:(m=e[2].search(this.rules.other.nonSpaceChar),m=m>4?1:m,u=d.slice(m),m+=e[1].length),h&&this.rules.other.blankLine.test(p)&&(l+=p+`
`,t=t.substring(p.length+1),c=!0),!c){const y=this.rules.other.nextBulletRegex(m),A=this.rules.other.hrRegex(m),j=this.rules.other.fencesBeginRegex(m),B=this.rules.other.headingBeginRegex(m),st=this.rules.other.htmlBeginRegex(m);for(;t;){const ue=t.split(`
`,1)[0];let q;if(p=ue,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,"  "),q=p):q=p.replace(this.rules.other.tabCharGlobal,"    "),j.test(p)||B.test(p)||st.test(p)||y.test(p)||A.test(p))break;if(q.search(this.rules.other.nonSpaceChar)>=m||!p.trim())u+=`
`+q.slice(m);else{if(h||d.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||j.test(d)||B.test(d)||A.test(d))break;u+=`
`+p}!h&&!p.trim()&&(h=!0),l+=ue+`
`,t=t.substring(ue.length+1),d=q.slice(m)}}n.loose||(a?n.loose=!0:this.rules.other.doubleBlankLine.test(l)&&(a=!0));let f=null,x;this.options.gfm&&(f=this.rules.other.listIsTask.exec(u),f&&(x=f[0]!=="[ ] ",u=u.replace(this.rules.other.listReplaceTask,""))),n.items.push({type:"list_item",raw:l,task:!!f,checked:x,loose:!1,text:u,tokens:[]}),n.raw+=l}const o=n.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;n.raw=n.raw.trimEnd();for(let c=0;c<n.items.length;c++)if(this.lexer.state.top=!1,n.items[c].tokens=this.lexer.blockTokens(n.items[c].text,[]),!n.loose){const l=n.items[c].tokens.filter(d=>d.type==="space"),u=l.length>0&&l.some(d=>this.rules.other.anyLine.test(d.raw));n.loose=u}if(n.loose)for(let c=0;c<n.items.length;c++)n.items[c].loose=!0;return n}}html(t){const e=this.rules.block.html.exec(t);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(t){const e=this.rules.block.def.exec(t);if(e){const s=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:s,raw:e[0],href:r,title:n}}}table(t){const e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;const s=at(e[1]),r=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:e[0],header:[],align:[],rows:[]};if(s.length===r.length){for(const a of r)this.rules.other.tableAlignRight.test(a)?i.align.push("right"):this.rules.other.tableAlignCenter.test(a)?i.align.push("center"):this.rules.other.tableAlignLeft.test(a)?i.align.push("left"):i.align.push(null);for(let a=0;a<s.length;a++)i.header.push({text:s[a],tokens:this.lexer.inline(s[a]),header:!0,align:i.align[a]});for(const a of n)i.rows.push(at(a,i.header.length).map((o,c)=>({text:o,tokens:this.lexer.inline(o),header:!1,align:i.align[c]})));return i}}lheading(t){const e=this.rules.block.lheading.exec(t);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(t){const e=this.rules.block.paragraph.exec(t);if(e){const s=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:s,tokens:this.lexer.inline(s)}}}text(t){const e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){const e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){const e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){const e=this.rules.inline.link.exec(t);if(e){const s=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(s)){if(!this.rules.other.endAngleBracket.test(s))return;const i=ee(s.slice(0,-1),"\\");if((s.length-i.length)%2===0)return}else{const i=Ns(e[2],"()");if(i===-2)return;if(i>-1){const o=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,o).trim(),e[3]=""}}let r=e[2],n="";if(this.options.pedantic){const i=this.rules.other.pedanticHrefTitle.exec(r);i&&(r=i[1],n=i[3])}else n=e[3]?e[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(s)?r=r.slice(1):r=r.slice(1,-1)),ot(e,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let s;if((s=this.rules.inline.reflink.exec(t))||(s=this.rules.inline.nolink.exec(t))){const r=(s[2]||s[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=e[r.toLowerCase()];if(!n){const i=s[0].charAt(0);return{type:"text",raw:i,text:i}}return ot(s,n,s[0],this.lexer,this.rules)}}emStrong(t,e,s=""){let r=this.rules.inline.emStrongLDelim.exec(t);if(!r||r[3]&&s.match(this.rules.other.unicodeAlphaNumeric))return;if(!(r[1]||r[2]||"")||!s||this.rules.inline.punctuation.exec(s)){const i=[...r[0]].length-1;let a,o,c=i,l=0;const u=r[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(u.lastIndex=0,e=e.slice(-1*t.length+i);(r=u.exec(e))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(o=[...a].length,r[3]||r[4]){c+=o;continue}else if((r[5]||r[6])&&i%3&&!((i+o)%3)){l+=o;continue}if(c-=o,c>0)continue;o=Math.min(o,o+c+l);const d=[...r[0]][0].length,p=t.slice(0,i+r.index+d+o);if(Math.min(i,o)%2){const m=p.slice(1,-1);return{type:"em",raw:p,text:m,tokens:this.lexer.inlineTokens(m)}}const h=p.slice(2,-2);return{type:"strong",raw:p,text:h,tokens:this.lexer.inlineTokens(h)}}}}codespan(t){const e=this.rules.inline.code.exec(t);if(e){let s=e[2].replace(this.rules.other.newLineCharGlobal," ");const r=this.rules.other.nonSpaceChar.test(s),n=this.rules.other.startingSpaceChar.test(s)&&this.rules.other.endingSpaceChar.test(s);return r&&n&&(s=s.substring(1,s.length-1)),{type:"codespan",raw:e[0],text:s}}}br(t){const e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t){const e=this.rules.inline.del.exec(t);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(t){const e=this.rules.inline.autolink.exec(t);if(e){let s,r;return e[2]==="@"?(s=e[1],r="mailto:"+s):(s=e[1],r=s),{type:"link",raw:e[0],text:s,href:r,tokens:[{type:"text",raw:s,text:s}]}}}url(t){let e;if(e=this.rules.inline.url.exec(t)){let s,r;if(e[2]==="@")s=e[0],r="mailto:"+s;else{let n;do n=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(n!==e[0]);s=e[0],e[1]==="www."?r="http://"+e[0]:r=e[0]}return{type:"link",raw:e[0],text:s,href:r,tokens:[{type:"text",raw:s,text:s}]}}}inlineText(t){const e=this.rules.inline.text.exec(t);if(e){const s=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:s}}}},M=class De{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||U,this.options.tokenizer=this.options.tokenizer||new _e,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const s={other:S,block:de.normal,inline:X.normal};this.options.pedantic?(s.block=de.pedantic,s.inline=X.pedantic):this.options.gfm&&(s.block=de.gfm,this.options.breaks?s.inline=X.breaks:s.inline=X.gfm),this.tokenizer.rules=s}static get rules(){return{block:de,inline:X}}static lex(e,s){return new De(s).lex(e)}static lexInline(e,s){return new De(s).inlineTokens(e)}lex(e){e=e.replace(S.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let s=0;s<this.inlineQueue.length;s++){const r=this.inlineQueue[s];this.inlineTokens(r.src,r.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,s=[],r=!1){for(this.options.pedantic&&(e=e.replace(S.tabCharGlobal,"    ").replace(S.spaceLine,""));e;){let n;if(this.options.extensions?.block?.some(a=>(n=a.call({lexer:this},e,s))?(e=e.substring(n.raw.length),s.push(n),!0):!1))continue;if(n=this.tokenizer.space(e)){e=e.substring(n.raw.length);const a=s.at(-1);n.raw.length===1&&a!==void 0?a.raw+=`
`:s.push(n);continue}if(n=this.tokenizer.code(e)){e=e.substring(n.raw.length);const a=s.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+n.raw,a.text+=`
`+n.text,this.inlineQueue.at(-1).src=a.text):s.push(n);continue}if(n=this.tokenizer.fences(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.heading(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.hr(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.blockquote(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.list(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.html(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.def(e)){e=e.substring(n.raw.length);const a=s.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=`
`+n.raw,a.text+=`
`+n.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title});continue}if(n=this.tokenizer.table(e)){e=e.substring(n.raw.length),s.push(n);continue}if(n=this.tokenizer.lheading(e)){e=e.substring(n.raw.length),s.push(n);continue}let i=e;if(this.options.extensions?.startBlock){let a=1/0;const o=e.slice(1);let c;this.options.extensions.startBlock.forEach(l=>{c=l.call({lexer:this},o),typeof c=="number"&&c>=0&&(a=Math.min(a,c))}),a<1/0&&a>=0&&(i=e.substring(0,a+1))}if(this.state.top&&(n=this.tokenizer.paragraph(i))){const a=s.at(-1);r&&a?.type==="paragraph"?(a.raw+=`
`+n.raw,a.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):s.push(n),r=i.length!==e.length,e=e.substring(n.raw.length);continue}if(n=this.tokenizer.text(e)){e=e.substring(n.raw.length);const a=s.at(-1);a?.type==="text"?(a.raw+=`
`+n.raw,a.text+=`
`+n.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):s.push(n);continue}if(e){const a="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,s}inline(e,s=[]){return this.inlineQueue.push({src:e,tokens:s}),s}inlineTokens(e,s=[]){let r=e,n=null;if(this.tokens.links){const o=Object.keys(this.tokens.links);if(o.length>0)for(;(n=this.tokenizer.rules.inline.reflinkSearch.exec(r))!=null;)o.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(r=r.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(n=this.tokenizer.rules.inline.anyPunctuation.exec(r))!=null;)r=r.slice(0,n.index)+"++"+r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(n=this.tokenizer.rules.inline.blockSkip.exec(r))!=null;)r=r.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let i=!1,a="";for(;e;){i||(a=""),i=!1;let o;if(this.options.extensions?.inline?.some(l=>(o=l.call({lexer:this},e,s))?(e=e.substring(o.raw.length),s.push(o),!0):!1))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);const l=s.at(-1);o.type==="text"&&l?.type==="text"?(l.raw+=o.raw,l.text+=o.text):s.push(o);continue}if(o=this.tokenizer.emStrong(e,r,a)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),s.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),s.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),s.push(o);continue}let c=e;if(this.options.extensions?.startInline){let l=1/0;const u=e.slice(1);let d;this.options.extensions.startInline.forEach(p=>{d=p.call({lexer:this},u),typeof d=="number"&&d>=0&&(l=Math.min(l,d))}),l<1/0&&l>=0&&(c=e.substring(0,l+1))}if(o=this.tokenizer.inlineText(c)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(a=o.raw.slice(-1)),i=!0;const l=s.at(-1);l?.type==="text"?(l.raw+=o.raw,l.text+=o.text):s.push(o);continue}if(e){const l="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(l);break}else throw new Error(l)}}return s}},Se=class{options;parser;constructor(t){this.options=t||U}space(t){return""}code({text:t,lang:e,escaped:s}){const r=(e||"").match(S.notSpaceStart)?.[0],n=t.replace(S.endingNewline,"")+`
`;return r?'<pre><code class="language-'+C(r)+'">'+(s?n:C(n,!0))+`</code></pre>
`:"<pre><code>"+(s?n:C(n,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){const e=t.ordered,s=t.start;let r="";for(let a=0;a<t.items.length;a++){const o=t.items[a];r+=this.listitem(o)}const n=e?"ol":"ul",i=e&&s!==1?' start="'+s+'"':"";return"<"+n+i+`>
`+r+"</"+n+`>
`}listitem(t){let e="";if(t.task){const s=this.checkbox({checked:!!t.checked});t.loose?t.tokens[0]?.type==="paragraph"?(t.tokens[0].text=s+" "+t.tokens[0].text,t.tokens[0].tokens&&t.tokens[0].tokens.length>0&&t.tokens[0].tokens[0].type==="text"&&(t.tokens[0].tokens[0].text=s+" "+C(t.tokens[0].tokens[0].text),t.tokens[0].tokens[0].escaped=!0)):t.tokens.unshift({type:"text",raw:s+" ",text:s+" ",escaped:!0}):e+=s+" "}return e+=this.parser.parse(t.tokens,!!t.loose),`<li>${e}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",s="";for(let n=0;n<t.header.length;n++)s+=this.tablecell(t.header[n]);e+=this.tablerow({text:s});let r="";for(let n=0;n<t.rows.length;n++){const i=t.rows[n];s="";for(let a=0;a<i.length;a++)s+=this.tablecell(i[a]);r+=this.tablerow({text:s})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+r+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){const e=this.parser.parseInline(t.tokens),s=t.header?"th":"td";return(t.align?`<${s} align="${t.align}">`:`<${s}>`)+e+`</${s}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${C(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:s}){const r=this.parser.parseInline(s),n=it(t);if(n===null)return r;t=n;let i='<a href="'+t+'"';return e&&(i+=' title="'+C(e)+'"'),i+=">"+r+"</a>",i}image({href:t,title:e,text:s,tokens:r}){r&&(s=this.parser.parseInline(r,this.parser.textRenderer));const n=it(t);if(n===null)return C(s);t=n;let i=`<img src="${t}" alt="${s}"`;return e&&(i+=` title="${C(e)}"`),i+=">",i}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:C(t.text)}},Ye=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}},N=class je{options;renderer;textRenderer;constructor(e){this.options=e||U,this.options.renderer=this.options.renderer||new Se,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Ye}static parse(e,s){return new je(s).parse(e)}static parseInline(e,s){return new je(s).parseInline(e)}parse(e,s=!0){let r="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions?.renderers?.[i.type]){const o=i,c=this.options.extensions.renderers[o.type].call({parser:this},o);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(o.type)){r+=c||"";continue}}const a=i;switch(a.type){case"space":{r+=this.renderer.space(a);continue}case"hr":{r+=this.renderer.hr(a);continue}case"heading":{r+=this.renderer.heading(a);continue}case"code":{r+=this.renderer.code(a);continue}case"table":{r+=this.renderer.table(a);continue}case"blockquote":{r+=this.renderer.blockquote(a);continue}case"list":{r+=this.renderer.list(a);continue}case"html":{r+=this.renderer.html(a);continue}case"paragraph":{r+=this.renderer.paragraph(a);continue}case"text":{let o=a,c=this.renderer.text(o);for(;n+1<e.length&&e[n+1].type==="text";)o=e[++n],c+=`
`+this.renderer.text(o);s?r+=this.renderer.paragraph({type:"paragraph",raw:c,text:c,tokens:[{type:"text",raw:c,text:c,escaped:!0}]}):r+=c;continue}default:{const o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return r}parseInline(e,s=this.renderer){let r="";for(let n=0;n<e.length;n++){const i=e[n];if(this.options.extensions?.renderers?.[i.type]){const o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){r+=o||"";continue}}const a=i;switch(a.type){case"escape":{r+=s.text(a);break}case"html":{r+=s.html(a);break}case"link":{r+=s.link(a);break}case"image":{r+=s.image(a);break}case"strong":{r+=s.strong(a);break}case"em":{r+=s.em(a);break}case"codespan":{r+=s.codespan(a);break}case"br":{r+=s.br(a);break}case"del":{r+=s.del(a);break}case"text":{r+=s.text(a);break}default:{const o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return r}},xe=class{options;block;constructor(t){this.options=t||U}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}provideLexer(){return this.block?M.lex:M.lexInline}provideParser(){return this.block?N.parse:N.parseInline}},js=class{defaults=Ue();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=N;Renderer=Se;TextRenderer=Ye;Lexer=M;Tokenizer=_e;Hooks=xe;constructor(...t){this.use(...t)}walkTokens(t,e){let s=[];for(const r of t)switch(s=s.concat(e.call(this,r)),r.type){case"table":{const n=r;for(const i of n.header)s=s.concat(this.walkTokens(i.tokens,e));for(const i of n.rows)for(const a of i)s=s.concat(this.walkTokens(a.tokens,e));break}case"list":{const n=r;s=s.concat(this.walkTokens(n.items,e));break}default:{const n=r;this.defaults.extensions?.childTokens?.[n.type]?this.defaults.extensions.childTokens[n.type].forEach(i=>{const a=n[i].flat(1/0);s=s.concat(this.walkTokens(a,e))}):n.tokens&&(s=s.concat(this.walkTokens(n.tokens,e)))}}return s}use(...t){const e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(s=>{const r={...s};if(r.async=this.defaults.async||r.async||!1,s.extensions&&(s.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){const i=e.renderers[n.name];i?e.renderers[n.name]=function(...a){let o=n.renderer.apply(this,a);return o===!1&&(o=i.apply(this,a)),o}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");const i=e[n.level];i?i.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),r.extensions=e),s.renderer){const n=this.defaults.renderer||new Se(this.defaults);for(const i in s.renderer){if(!(i in n))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;const a=i,o=s.renderer[a],c=n[a];n[a]=(...l)=>{let u=o.apply(n,l);return u===!1&&(u=c.apply(n,l)),u||""}}r.renderer=n}if(s.tokenizer){const n=this.defaults.tokenizer||new _e(this.defaults);for(const i in s.tokenizer){if(!(i in n))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;const a=i,o=s.tokenizer[a],c=n[a];n[a]=(...l)=>{let u=o.apply(n,l);return u===!1&&(u=c.apply(n,l)),u}}r.tokenizer=n}if(s.hooks){const n=this.defaults.hooks||new xe;for(const i in s.hooks){if(!(i in n))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;const a=i,o=s.hooks[a],c=n[a];xe.passThroughHooks.has(i)?n[a]=l=>{if(this.defaults.async)return Promise.resolve(o.call(n,l)).then(d=>c.call(n,d));const u=o.call(n,l);return c.call(n,u)}:n[a]=(...l)=>{let u=o.apply(n,l);return u===!1&&(u=c.apply(n,l)),u}}r.hooks=n}if(s.walkTokens){const n=this.defaults.walkTokens,i=s.walkTokens;r.walkTokens=function(a){let o=[];return o.push(i.call(this,a)),n&&(o=o.concat(n.call(this,a))),o}}this.defaults={...this.defaults,...r}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return M.lex(t,e??this.defaults)}parser(t,e){return N.parse(t,e??this.defaults)}parseMarkdown(t){return(s,r)=>{const n={...r},i={...this.defaults,...n},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&n.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof s>"u"||s===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof s!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(s)+", string expected"));i.hooks&&(i.hooks.options=i,i.hooks.block=t);const o=i.hooks?i.hooks.provideLexer():t?M.lex:M.lexInline,c=i.hooks?i.hooks.provideParser():t?N.parse:N.parseInline;if(i.async)return Promise.resolve(i.hooks?i.hooks.preprocess(s):s).then(l=>o(l,i)).then(l=>i.hooks?i.hooks.processAllTokens(l):l).then(l=>i.walkTokens?Promise.all(this.walkTokens(l,i.walkTokens)).then(()=>l):l).then(l=>c(l,i)).then(l=>i.hooks?i.hooks.postprocess(l):l).catch(a);try{i.hooks&&(s=i.hooks.preprocess(s));let l=o(s,i);i.hooks&&(l=i.hooks.processAllTokens(l)),i.walkTokens&&this.walkTokens(l,i.walkTokens);let u=c(l,i);return i.hooks&&(u=i.hooks.postprocess(u)),u}catch(l){return a(l)}}}onError(t,e){return s=>{if(s.message+=`
Please report this to https://github.com/markedjs/marked.`,t){const r="<p>An error occurred:</p><pre>"+C(s.message+"",!0)+"</pre>";return e?Promise.resolve(r):r}if(e)return Promise.reject(s);throw s}}},H=new js;function g(t,e){return H.parse(t,e)}g.options=g.setOptions=function(t){return H.setOptions(t),g.defaults=H.defaults,Tt(g.defaults),g};g.getDefaults=Ue;g.defaults=U;g.use=function(...t){return H.use(...t),g.defaults=H.defaults,Tt(g.defaults),g};g.walkTokens=function(t,e){return H.walkTokens(t,e)};g.parseInline=H.parseInline;g.Parser=N;g.parser=N.parse;g.Renderer=Se;g.TextRenderer=Ye;g.Lexer=M;g.lexer=M.lex;g.Tokenizer=_e;g.Hooks=xe;g.parse=g;g.options;g.setOptions;g.use;g.walkTokens;g.parseInline;N.parse;M.lex;const Bs=new Set(["p","br","strong","em","code","pre","ul","ol","li","h1","h2","h3","h4","h5","h6","a","blockquote","hr","table","thead","tbody","tr","th","td"]),Os=new Set(["class"]),qs={a:new Set(["href","title","target","rel"]),code:new Set(["class"])};g.setOptions({gfm:!0,breaks:!0,async:!1});function Bt(t){const e={1:{label:"Easy",class:"badge-easy"},2:{label:"Medium",class:"badge-medium"},3:{label:"Hard",class:"badge-hard"}};return e[t]||e[1]}function E(t,e="info",s=3e3){const r=document.getElementById("toast-container");if(!r)return;const n={success:"bg-green-600",error:"bg-red-600",info:"bg-zinc-700"},i=document.createElement("div");i.className=`${n[e]||n.info} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in text-sm max-w-sm`,i.setAttribute("role","status"),i.setAttribute("aria-live","polite"),i.textContent=String(t||""),r.appendChild(i),window.setTimeout(()=>{i.style.opacity="0",i.style.transition="opacity 0.3s",window.setTimeout(()=>i.remove(),300)},s)}function le(t="md"){const e={sm:"w-4 h-4",md:"w-6 h-6",lg:"w-10 h-10"};return`
    <div class="flex items-center justify-center p-8" role="status" aria-live="polite" aria-label="Cargando contenido">
      <div class="${e[t]||e.md} border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
    </div>
  `}function Hs(t){const e=document.createElement("div");return e.textContent=String(t||""),e.innerHTML}function Fs(t){const e=String(t||"").trim();if(!e)return"#";if(e.startsWith("#"))return e;try{const s=new URL(e,window.location.origin);return new Set(["http:","https:","mailto:"]).has(s.protocol)?s.toString():"#"}catch{return"#"}}function Us(t){if(typeof DOMParser>"u")return Hs(t);const s=new DOMParser().parseFromString(`<div>${t}</div>`,"text/html"),r=s.body.firstElementChild;if(!r)return"";const n=[],i=s.createTreeWalker(r,NodeFilter.SHOW_ELEMENT);for(;i.nextNode();)n.push(i.currentNode);return n.forEach(a=>{const o=a.tagName.toLowerCase();if(!Bs.has(o)){const c=s.createDocumentFragment();for(;a.firstChild;)c.appendChild(a.firstChild);a.replaceWith(c);return}if([...a.attributes].forEach(c=>{const l=c.name.toLowerCase(),u=l.startsWith("on"),d=Os.has(l),p=qs[o]?.has(l)||!1;(u||!d&&!p)&&a.removeAttribute(c.name)}),o==="a"){const c=Fs(a.getAttribute("href"));a.setAttribute("href",c),a.getAttribute("target")==="_blank"?a.setAttribute("rel","noopener noreferrer nofollow"):(a.removeAttribute("target"),a.removeAttribute("rel"))}}),r.innerHTML}function Ot(t=""){if(!t)return"";const e=String(t||"").replace(/\r\n/g,`
`),s=g.parse(e,{mangle:!1,headerIds:!1});return Us(s)}function Vs(t){const e=Bt(t.difficulty),s=(t.tags||[]).slice(0,3).map(r=>`<span class="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">${r}</span>`).join("");return`
    <a href="#/problem/${t.slug}"
       class="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition group">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 class="font-semibold text-zinc-100 group-hover:text-brand transition">
            ${t.title}
          </h3>
          <p class="text-xs text-zinc-500 mt-1">
            ${t.submissions?.toLocaleString?.()||t.submissions||0} submissions
          </p>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${e.class}">
          ${e.label}
        </span>
      </div>

      <div class="flex items-center gap-2 flex-wrap mb-2">
        ${s}
      </div>

      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span>${Number(t.acceptance||0).toFixed(1)}% acceptance</span>
        <span>${t.stages_count} etapas</span>
      </div>
    </a>
  `}const Gs=Object.assign({});function R(t){return typeof t!="string"?"":t.replace(/\\n/g,`
`).trim()}function Zs(t=""){return R(t).replace(/^\s*\*\s*@backend\/.*$/gm,"").replace(/\n{3,}/g,`

`).trimEnd()}function Ws(t={}){const e={};return Object.entries(t).forEach(([s,r])=>{e[s.toLowerCase()]=Zs(r)}),e.python||(e.python=["class Solution:","    def solve(self):","        # Write your solution here","        pass"].join(`
`)),e.javascript||(e.javascript=["function solve() {","  // Write your solution here","}"].join(`
`)),e}function Ks(t){const e=[],s=R(t.description);if(s&&e.push(`## Description
${s}`),Array.isArray(t.examples)&&t.examples.length){const r=t.examples.map((n,i)=>{const a=[`### Example ${i+1}`];return n.input&&a.push(`- Input: \`${R(n.input)}\``),n.output&&a.push(`- Output: \`${R(n.output)}\``),n.explanation&&a.push(`- Explanation: ${R(n.explanation)}`),a.join(`
`)}).join(`

`);e.push(`## Examples
${r}`)}if(Array.isArray(t.constraints)&&t.constraints.length){const r=t.constraints.map(n=>`- ${R(n)}`).join(`
`);e.push(`## Constraints
${r}`)}return e.join(`

`)}function Js(t,e,s){const r=Number(e.stage_index||s+1),n=Array.isArray(e.tests)?e.tests:[],i=n.filter(a=>!a.is_hidden).map(a=>({input_text:R(a.input_text),expected_text:R(a.expected_text)}));return{id:`${t}-stage-${r}`,stage_index:r,prompt_md:R(e.prompt_md)||`Solve stage ${r}.`,time_limit_ms:Number(e.time_limit_ms||0),visible_tests:i,hidden_count:n.length-i.length}}function Qs(t){const e=t?.default||t,s=(e.stages||[]).map((i,a)=>Js(e.id,i,a)).sort((i,a)=>i.stage_index-a.stage_index),r=Ws(e.starterCode||{}),n=Number(e.difficulty||1);return{id:e.id,slug:e.id,title:R(e.title),difficulty:n,tags:Array.isArray(e.tags)?e.tags:[],acceptance:Number(e.acceptance||0),submissions:Number(e.submissions||0),description:R(e.description),examples:Array.isArray(e.examples)?e.examples:[],constraints:Array.isArray(e.constraints)?e.constraints:[],statement_md:Ks(e),starter_code:r,starterCode:r,stages:s,stages_count:s.length}}const Xe=Object.values(Gs).map(Qs).sort((t,e)=>t.difficulty-e.difficulty||t.title.localeCompare(e.title));function Ys(){return Xe}function te(t){return Xe.find(e=>e.slug===t||e.id===t)||null}function Xs(){return[...new Set(Xe.flatMap(t=>t.tags))].sort((t,e)=>t.localeCompare(e))}const qt="Riwlog_local_db_v2",en="Riwlog_token",tn="Riwlog_user",sn="Riwlog_expires_at",Ee=typeof window<"u",nn=[{username:"algorithmist",score:4850,solved:87,streak:32},{username:"code_ninja",score:4720,solved:82,streak:28},{username:"byte_master",score:4580,solved:79,streak:21},{username:"devSara",score:4320,solved:74,streak:18},{username:"logic_lord",score:4100,solved:71,streak:15},{username:"func_wizard",score:3920,solved:68,streak:14},{username:"recursion_queen",score:3780,solved:65,streak:12},{username:"stack_overflow",score:3650,solved:62,streak:11},{username:"dp_guru",score:3500,solved:59,streak:9},{username:"hash_hero",score:3350,solved:56,streak:7}],pe=[{id:"user_demo",username:"demo",email:"demo@riwlog.dev",password:"123456",display_name:"Demo User",created_at:"2026-01-03T10:00:00.000Z"},{id:"user_code_ninja",username:"code_ninja",email:"code@riwlog.dev",password:"123456",display_name:"Code Ninja",created_at:"2025-11-22T10:00:00.000Z"}];let ie=null;function se(t){return JSON.parse(JSON.stringify(t))}function ve(){return new Date().toISOString()}function Be(t){return`${t}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`}function Ht(t){let e=0;for(let s=0;s<t.length;s+=1)e=(e<<5)-e+t.charCodeAt(s),e|=0;return Math.abs(e)}function Te(t){return Ee?window.localStorage.getItem(t):null}function rn(t,e){Ee&&window.localStorage.setItem(t,e)}function an(){if(!Ee)return{users:se(pe),sessions:{},submissions:[]};const t=window.localStorage.getItem(qt);if(!t)return{users:se(pe),sessions:{},submissions:[]};try{const e=JSON.parse(t);return{users:Array.isArray(e.users)?e.users:se(pe),sessions:e.sessions&&typeof e.sessions=="object"?e.sessions:{},submissions:Array.isArray(e.submissions)?e.submissions:[]}}catch{return{users:se(pe),sessions:{},submissions:[]}}}function L(){return ie||(ie=an()),ie}function K(){!Ee||!ie||rn(qt,JSON.stringify(ie))}function Le(t){return{id:t.id,username:t.username,email:t.email,display_name:t.display_name||t.username,created_at:t.created_at}}function lt(t){const e=L(),s=Be("token");return e.sessions[s]={user_id:t,created_at:ve()},K(),s}function Ft(t){const e=L(),s=String(t||"").trim().toLowerCase();return e.users.find(r=>r.email.toLowerCase()===s)||e.users.find(r=>r.username.toLowerCase()===s)||null}function Oe(t){return t&&L().users.find(s=>s.id===t)||null}function on(){const t=L(),e=Te(sn);if(e){const n=new Date(e).getTime();if(Number.isNaN(n)||n<=Date.now())return null}const s=Te(en);if(s&&t.sessions[s])return Oe(t.sessions[s].user_id);const r=Te(tn);if(!r)return null;try{const n=JSON.parse(r);return Oe(n.id)||Ft(n.email||n.username)}catch{return null}}function G(){const t=on();if(!t)throw new Error("Debes iniciar sesión para continuar.");return t}function ln(t,e){return t.stages.find(s=>s.id===e)||null}function cn(t=[]){const e=t.reduce((a,o)=>(o.type==="key"&&(a.key+=Number(o.char_count||0)),o.type==="paste"&&(a.paste+=Number(o.char_count||0)),o.type==="delete"&&(a.delete+=Number(o.char_count||0)),o.type==="run"&&(a.run+=1),a),{key:0,paste:0,delete:0,run:0}),s=e.key+e.paste,r=s>0?e.paste/s:0;let n="human";r>=.7?n="ai_generated":r>=.35&&(n="assisted");let i=.55+r*.4;return e.run>=3&&r<.2&&(i-=.08),{label:n,confidence:Number(Math.max(.5,Math.min(.98,i)).toFixed(2))}}function un(t,e){const s=String(t||"").trim(),r=Ht(`${e.id}|${s}`),n=s.length<24,i=/\b(pass|todo|write your solution here)\b/i.test(s),a=!n&&!i&&r%100>=28,o=Array.isArray(e.visible_tests)?e.visible_tests:[],c=o.length?r%o.length:-1,l=o.map((u,d)=>{const p=a?!0:d!==c;return{input_text:u.input_text,expected_text:u.expected_text,passed:p,error:p?null:"Output mismatch"}});return{passed:a,runtime_ms:12+r%180,stage_score:a?Math.max(55,100-r%22):Math.max(8,30-r%15),visible_results:l}}function ct(t){return L().submissions.filter(s=>s.user_id===t)}function dn(t,e){if(e==="all")return!0;const s=new Date(t);if(Number.isNaN(s.getTime()))return!1;const r=new Date;return e==="today"?s.toDateString()===r.toDateString():e==="week"?r.getTime()-s.getTime()<=10080*60*1e3:!0}function ut(t="all"){const e=L(),s=new Map;t==="all"&&nn.forEach(i=>{s.set(i.username.toLowerCase(),{username:i.username,avatar:i.username[0].toUpperCase(),score:i.score,solved:i.solved,streak:i.streak})});const r=new Map;return e.submissions.filter(i=>dn(i.submitted_at||i.created_at,t)).forEach(i=>{const a=Oe(i.user_id);if(!a)return;const o=a.username.toLowerCase(),c=s.get(o)||{username:a.username,avatar:a.username[0].toUpperCase(),score:0,solved:0,streak:0};c.score+=Number(i.final_score||0),r.has(o)||r.set(o,new Set),i.verdict==="accepted"&&r.get(o).add(i.problem_id),c.solved=Math.max(c.solved,r.get(o).size),c.streak=Math.max(c.streak,1+Ht(o)%14),s.set(o,c)}),[...s.values()].sort((i,a)=>a.score-i.score||a.solved-i.solved||i.username.localeCompare(a.username)).slice(0,100).map((i,a)=>({rank:a+1,username:i.username,avatar:i.avatar,score:Math.round(i.score),total_score:Math.round(i.score),solved:i.solved,streak:i.streak}))}function pn(t){if(!t.length)return 0;const e=new Set(t.map(n=>new Date(n.submitted_at||n.created_at).toISOString().slice(0,10)));let s=0;const r=new Date;for(let n=0;n<60;n+=1){const i=r.toISOString().slice(0,10);if(!e.has(i))break;s+=1,r.setDate(r.getDate()-1)}return s||1}function hn(t){const e={easy:0,medium:0,hard:0};return t.forEach(s=>{const r=te(s);r&&(r.difficulty===1&&(e.easy+=1),r.difficulty===2&&(e.medium+=1),r.difficulty===3&&(e.hard+=1))}),e}function mn({solved:t,hardSolved:e,streak:s,totalScore:r}){const n=[];return t>=1&&n.push({name:"First Solve",description:"Resolved your first challenge",icon:"check-circle"}),t>=5&&n.push({name:"Consistency",description:"Solved 5+ different problems",icon:"award"}),e>=3&&n.push({name:"Hard Crusher",description:"Solved 3 hard challenges",icon:"trophy"}),s>=7&&n.push({name:"Streak Master",description:"Maintained a 7-day streak",icon:"flame"}),r>=1e3&&n.push({name:"Speed Demon",description:"Reached 1000+ total points",icon:"zap"}),n.length||n.push({name:"Getting Started",description:"Complete your first submission",icon:"award"}),n}function fn(t){return{id:t.id,problem_id:t.problem_id,problem_title:t.problem_title,verdict:t.verdict,language:t.language,final_score:Number(t.final_score||0),runtime_ms:Number(t.runtime_ms||0),submitted_at:t.submitted_at||t.created_at,stage_results:t.stage_results}}const we={bootstrap(){L()},auth:{async login({email:t,password:e}){const s=String(t||"").trim(),r=String(e||"").trim();if(!s||!r)throw new Error("Debes enviar email y contraseña.");const n=Ft(s);if(!n||n.password!==r)throw new Error("Credenciales inválidas.");return{access_token:lt(n.id),user:Le(n)}},async register({username:t,email:e,password:s}){const r=L(),n=String(t||"").trim(),i=String(e||"").trim().toLowerCase(),a=String(s||"").trim();if(!n||!i||!a)throw new Error("Todos los campos son obligatorios.");if(a.length<6)throw new Error("La contraseña debe tener al menos 6 caracteres.");if(r.users.some(l=>l.username.toLowerCase()===n.toLowerCase()))throw new Error("Ese username ya está en uso.");if(r.users.some(l=>l.email.toLowerCase()===i))throw new Error("Ese email ya está registrado.");const o={id:Be("user"),username:n,email:i,password:a,display_name:n,created_at:ve()};return r.users.push(o),K(),{access_token:lt(o.id),user:Le(o)}}},problems:{async list(t={}){const e=t.difficulty?Number(t.difficulty):null,s=String(t.search||"").trim().toLowerCase(),r=String(t.tag||"").trim().toLowerCase();return Ys().filter(n=>{const i=!e||n.difficulty===e,a=!s||n.title.toLowerCase().includes(s),o=!r||n.tags.some(c=>c.toLowerCase()===r);return i&&a&&o})},async get(t){const e=te(String(t||"").trim());if(!e)throw new Error("Problema no encontrado.");return e},async tags(){return Xs()}},submissions:{async start(t,e="python"){const s=G(),r=te(t);if(!r)throw new Error("Problema inválido.");const n=L(),i={id:Be("sub"),user_id:s.id,problem_id:r.id,problem_title:r.title,language:e,code:"",stage_results:{},runtime_ms:0,final_score:0,verdict:"pending",events:[],created_at:ve(),submitted_at:null};return n.submissions.push(i),K(),{submission_id:i.id}},async run({submission_id:t,stage_id:e,code:s,events:r=[]}){const n=G(),a=L().submissions.find(d=>d.id===t&&d.user_id===n.id);if(!a)throw new Error("No se encontró la submission activa.");const o=te(a.problem_id);if(!o)throw new Error("No se encontró el problema de la submission.");const c=ln(o,e);if(!c)throw new Error("Stage inválido.");const l=un(s,c),u=cn(r);return a.code=String(s||""),a.runtime_ms=l.runtime_ms,a.stage_results[c.id]={stage_id:c.id,stage_index:c.stage_index,passed:l.passed,stage_score:l.stage_score,runtime_ms:l.runtime_ms},a.events.push(...r),K(),{passed:l.passed,stage_index:c.stage_index,stage_score:l.stage_score,runtime_ms:l.runtime_ms,visible_results:l.visible_results,classification:u}},async submit(t){const e=G(),r=L().submissions.find(d=>d.id===t&&d.user_id===e.id);if(!r)throw new Error("Submission no encontrada.");const n=te(r.problem_id);if(!n)throw new Error("Problema no encontrado.");const i=n.stages.map(d=>r.stage_results[d.id]).filter(Boolean);if(!i.length)throw new Error("Primero ejecuta al menos una etapa.");const o=i.length===n.stages.length&&i.every(d=>d.passed),c=i.reduce((d,p)=>d+Number(p.stage_score||0),0)/i.length,l=i.length/Math.max(1,n.stages.length),u=Math.round(c*l);return r.final_score=u,r.verdict=o?"accepted":"wrong_answer",r.submitted_at=ve(),K(),{verdict:r.verdict,final_score:u}},async sendEvents(t,e=[]){const s=G(),n=L().submissions.find(i=>i.id===t&&i.user_id===s.id);return n?(n.events.push(...e),K(),{ok:!0}):{ok:!1}}},leaderboard:{async get({timeframe:t="all"}={}){return se(ut(t))}},profile:{async me(){const t=G(),e=ct(t.id),s=new Set(e.filter(u=>u.verdict==="accepted").map(u=>u.problem_id)),r=hn(s),n=e.reduce((u,d)=>u+Number(d.final_score||0),0),i=s.size,a=pn(e),o=ut("all"),c=o.find(u=>u.username.toLowerCase()===t.username.toLowerCase())?.rank||o.length+1,l=mn({solved:i,hardSolved:r.hard,streak:a,totalScore:n});return{user:Le(t),stats:{total_score:n,solved:i,by_difficulty:r},streak:a,rank:c,badges:l}},async submissions(){const t=G();return ct(t.id).slice().sort((e,s)=>new Date(s.submitted_at||s.created_at).getTime()-new Date(e.submitted_at||e.created_at).getTime()).map(fn)}}},k=Object.freeze({health:{method:"GET",path:"/health"},authLogin:{method:"POST",path:"/auth/login"},authRegister:{method:"POST",path:"/auth/register"},problemsList:{method:"GET",path:"/problems"},problemBySlug:{method:"GET",path:"/problems/:slug"},problemTags:{method:"GET",path:"/problems/tags"},submissionStart:{method:"POST",path:"/submissions/start"},submissionRun:{method:"POST",path:"/submissions/run"},submissionSubmit:{method:"POST",path:"/submissions/:id/submit"},submissionEvents:{method:"POST",path:"/submissions/:id/events"},leaderboard:{method:"GET",path:"/leaderboard"},profile:{method:"GET",path:"/profile/me"},profileSubmissions:{method:"GET",path:"/profile/submissions"}});class gn extends Error{constructor(e,s=null){super(e),this.name="ApiContractError",this.payload=s}}function V(t,e,s=null){if(!t)throw new gn(e,s)}function w(t,e){return V(t&&typeof t=="object"&&!Array.isArray(t),`${e} must be an object`,t),t}function v(t,e){return V(typeof t=="string"&&t.trim().length>0,`${e} must be a non-empty string`,t),t}function Ut(t,e){return V(typeof t=="number"&&Number.isFinite(t),`${e} must be a finite number`,t),t}function D(t,e){return V(Array.isArray(t),`${e} must be an array`,t),t}function bn(t,e){const s=Ut(t,e);return V([1,2,3].includes(s),`${e} must be 1, 2 or 3`,t),s}function Vt(t,e="user"){const s=w(t,e);return{id:v(s.id,`${e}.id`),username:v(s.username,`${e}.username`),email:v(s.email,`${e}.email`),display_name:v(s.display_name||s.username,`${e}.display_name`),created_at:v(s.created_at||new Date().toISOString(),`${e}.created_at`)}}function Gt(t,e=0){const s=w(t,`problems.items[${e}]`);return{id:v(s.id,`problems.items[${e}].id`),slug:v(s.slug||s.id,`problems.items[${e}].slug`),title:v(s.title,`problems.items[${e}].title`),difficulty:bn(s.difficulty,`problems.items[${e}].difficulty`),tags:D(s.tags||[],`problems.items[${e}].tags`).map((r,n)=>v(r,`problems.items[${e}].tags[${n}]`)),acceptance:Number(s.acceptance||0),submissions:Number(s.submissions||0),stages_count:Number(s.stages_count||0)}}function xn(t,e){const s=w(t,e);return{input_text:v(s.input_text,`${e}.input_text`),expected_text:v(s.expected_text,`${e}.expected_text`)}}function vn(t,e){const s=w(t,`problem.stages[${e}]`);return{id:v(s.id,`problem.stages[${e}].id`),stage_index:Ut(s.stage_index,`problem.stages[${e}].stage_index`),prompt_md:v(s.prompt_md||`Stage ${e+1}`,`problem.stages[${e}].prompt_md`),hidden_count:Number(s.hidden_count||0),visible_tests:D(s.visible_tests||[],`problem.stages[${e}].visible_tests`).map((r,n)=>xn(r,`problem.stages[${e}].visible_tests[${n}]`))}}function wn(t){const e=w(t,"problem.starter_code"),s=Object.entries(e).filter(([,r])=>typeof r=="string"&&r.trim().length>0);return V(s.length>0,"problem.starter_code must contain at least one non-empty language",t),Object.fromEntries(s.map(([r,n])=>[r,n]))}function yn(t){const e=w(t,"problem");return{...Gt(e,0),statement_md:v(e.statement_md||"","problem.statement_md"),starter_code:wn(e.starter_code||e.starterCode||{}),stages:D(e.stages||[],"problem.stages").map((s,r)=>vn(s,r))}}function kn(t){const e=w(t,"submissions.run.result");return{passed:!!e.passed,stage_index:Number(e.stage_index||1),stage_score:Number(e.stage_score||0),runtime_ms:Number(e.runtime_ms||0),visible_results:D(e.visible_results||[],"submissions.run.result.visible_results").map((s,r)=>{const n=w(s,`submissions.run.result.visible_results[${r}]`);return{input_text:String(n.input_text||""),expected_text:String(n.expected_text||""),passed:!!n.passed,error:n.error?String(n.error):null}}),classification:e.classification?{label:v(e.classification.label,"submissions.run.result.classification.label"),confidence:Number(e.classification.confidence||0)}:null}}function _n(t,e){const s=w(t,`leaderboard.items[${e}]`);return{rank:Number(s.rank||e+1),username:v(s.username,`leaderboard.items[${e}].username`),avatar:String(s.avatar||s.username[0].toUpperCase()),score:Number(s.score??s.total_score??0),total_score:Number(s.total_score??s.score??0),solved:Number(s.solved||0),streak:Number(s.streak||0)}}function Sn(t){const e=w(t,"profile"),s=w(e.stats,"profile.stats"),r=w(s.by_difficulty||{},"profile.stats.by_difficulty");return{user:Vt(e.user,"profile.user"),stats:{total_score:Number(s.total_score||0),solved:Number(s.solved||0),by_difficulty:{easy:Number(r.easy||0),medium:Number(r.medium||0),hard:Number(r.hard||0)}},streak:Number(e.streak||0),rank:Number(e.rank||0),badges:D(e.badges||[],"profile.badges").map((n,i)=>{const a=w(n,`profile.badges[${i}]`);return{name:v(a.name,`profile.badges[${i}].name`),description:v(a.description,`profile.badges[${i}].description`),icon:a.icon?String(a.icon):"award"}})}}function $n(t,e){const s=w(t,`profile.submissions.items[${e}]`);return{id:v(s.id,`profile.submissions.items[${e}].id`),problem_id:v(s.problem_id,`profile.submissions.items[${e}].problem_id`),problem_title:v(s.problem_title||s.problem_id,`profile.submissions.items[${e}].problem_title`),verdict:v(s.verdict||"pending",`profile.submissions.items[${e}].verdict`),language:v(s.language||"python",`profile.submissions.items[${e}].language`),final_score:Number(s.final_score||0),runtime_ms:Number(s.runtime_ms||0),submitted_at:v(s.submitted_at||new Date().toISOString(),`profile.submissions.items[${e}].submitted_at`),stage_results:s.stage_results&&typeof s.stage_results=="object"?s.stage_results:{}}}function zn(t){const e=w(t,"health");return V(e.ok===!0||e.status==="ok","health response must contain ok=true or status='ok'",t),{ok:!0}}function dt(t){const e=w(t,"auth response");return{access_token:v(e.access_token,"auth.access_token"),user:Vt(e.user,"auth.user")}}function En(t){const e=w(t,"problems list response");return D(e.items,"problems list response.items").map((r,n)=>Gt(r,n))}function Tn(t){const e=w(t,"problem response");return yn(e.item)}function Ln(t){const e=w(t,"tags response");return D(e.items,"tags response.items").map((s,r)=>v(s,`tags response.items[${r}]`))}function Rn(t){const e=w(t,"submission start response");return{submission_id:v(e.submission_id,"submission_start.submission_id")}}function An(t){const e=w(t,"submission run response");return kn(e.result)}function Cn(t){const e=w(t,"submission submit response");return{verdict:v(e.verdict||"pending","submission_submit.verdict"),final_score:Number(e.final_score||0)}}function Pn(t){return{ok:!!w(t,"submission events response").ok}}function In(t){const e=w(t,"leaderboard response");return D(e.items,"leaderboard response.items").map((r,n)=>_n(r,n))}function Mn(t){return Sn(t)}function Nn(t){const e=w(t,"profile submissions response");return D(e.items,"profile submissions response.items").map((r,n)=>$n(r,n))}const Zt="http://localhost:8000/api",Dn="Riwlog_token";class et extends Error{constructor(e,s,r=null,n=null){super(s||`HTTP ${e}`),this.name="ApiHttpError",this.status=e,this.payload=r,this.url=n?.url||null,this.contentType=n?.contentType||null}}function jn(t,e={}){let s=t.path;return Object.entries(e).forEach(([r,n])=>{s=s.replace(`:${r}`,encodeURIComponent(String(n)))}),`${Zt}${s}`}function Bn(t,e=4500){return Promise.race([t,new Promise((s,r)=>{window.setTimeout(()=>r(new Error("remote_timeout")),e)})])}function Wt(t,{params:e,query:s}={}){const r=jn(t,e);if(!s||!Object.keys(s).length)return r;const n=new URLSearchParams;Object.entries(s).forEach(([a,o])=>{o==null||o===""||n.set(a,String(o))});const i=n.toString();return i?`${r}?${i}`:r}function On(){const t=window.localStorage.getItem(Dn);return t?{Authorization:`Bearer ${t}`}:{}}async function T(t,{body:e,query:s,params:r,requireAuth:n=!1,timeoutMs:i}={}){const a=t.method||"GET",o=Wt(t,{params:r,query:s});let c;try{c=await Bn(window.fetch(o,{method:a,mode:"cors",headers:{...e?{"Content-Type":"application/json"}:{},...n?On():{}},body:e?JSON.stringify(e):void 0}),i)}catch(p){throw p instanceof Error&&p.message==="remote_timeout"?p:new Error("remote_unreachable")}const l=c.headers.get("content-type")||"",d=l.includes("application/json")?await c.json().catch(()=>null):await c.text().catch(()=>null);if(!c.ok){const p=d&&typeof d=="object"&&(d.message||d.detail||d.error)||c.statusText||"Request failed";throw new et(c.status,String(p),d,{url:c.url||o,contentType:l})}return{payload:d,meta:{url:c.url||o,status:c.status,contentType:l}}}function qn(t){return t===null?"null":Array.isArray(t)?"array":typeof t}function he({url:t,status:e,contentType:s,reason:r}){const n=t||`${Zt}${k.health.path}`,i=typeof e=="number"?String(e):"n/a";return`Health check failed. url=${n} status=${i} content-type=${s||"unknown"} reason=${r}`}const pt={async healthCheck(){const t=Wt(k.health);let e;try{e=await T(k.health,{timeoutMs:1e3})}catch(i){if(i instanceof et)throw new Error(he({url:i.url||t,status:i.status,contentType:i.contentType,reason:i.message}));const a=i instanceof Error?i.message:String(i);throw new Error(he({url:t,status:null,contentType:null,reason:a}))}const{payload:s,meta:r}=e;if(!(s&&typeof s=="object"&&!Array.isArray(s)))throw new Error(he({url:r.url,status:r.status,contentType:r.contentType,reason:`expected JSON object but received ${qn(s)}`}));try{return zn(s)}catch(i){const a=i instanceof Error?i.message:String(i);throw new Error(he({url:r.url,status:r.status,contentType:r.contentType,reason:a}))}},auth:{async login({email:t,password:e}){const{payload:s}=await T(k.authLogin,{body:{email:t,password:e}});return dt(s)},async register({username:t,email:e,password:s}){const{payload:r}=await T(k.authRegister,{body:{username:t,email:e,password:s}});return dt(r)}},problems:{async list(t={}){const{payload:e}=await T(k.problemsList,{query:t});return En(e)},async get(t){const{payload:e}=await T(k.problemBySlug,{params:{slug:t}});return Tn(e)},async tags(){const{payload:t}=await T(k.problemTags);return Ln(t)}},submissions:{async start(t,e="python"){const{payload:s}=await T(k.submissionStart,{requireAuth:!0,body:{problem_id:t,language:e}});return Rn(s)},async run(t){const{payload:e}=await T(k.submissionRun,{requireAuth:!0,body:t});return An(e)},async submit(t){const{payload:e}=await T(k.submissionSubmit,{requireAuth:!0,params:{id:t}});return Cn(e)},async sendEvents(t,e=[]){const{payload:s}=await T(k.submissionEvents,{requireAuth:!0,params:{id:t},body:{events:e}});return Pn(s)}},leaderboard:{async get({timeframe:t="all"}={}){const{payload:e}=await T(k.leaderboard,{query:{timeframe:t}});return In(e)}},profile:{async me(){const{payload:t}=await T(k.profile,{requireAuth:!0});return Mn(t)},async submissions(){const{payload:t}=await T(k.profileSubmissions,{requireAuth:!0});return Nn(t)}}},ae="local",qe="remote",Kt="hybrid",Hn=new Set([ae,qe,Kt]),ht="remote".toLowerCase(),He=Hn.has(ht)?ht:Kt,z={configuredMode:He,activeProvider:ae,backendAvailable:!1,bootstrappedAt:null,lastError:null};let _=we;async function Fn(){if(we.bootstrap(),He===ae){_=we,z.activeProvider=ae,z.backendAvailable=!1,z.lastError=null,z.bootstrappedAt=new Date().toISOString();return}try{await pt.healthCheck(),_=pt,z.activeProvider=qe,z.backendAvailable=!0,z.lastError=null,z.bootstrappedAt=new Date().toISOString()}catch(t){const e=t instanceof et?`Backend respondió ${t.status}: ${t.message}`:t instanceof Error?t.message:String(t);if(z.lastError=e,z.bootstrappedAt=new Date().toISOString(),He===qe)throw new Error(`No se pudo inicializar la API remota. ${e}`);_=we,z.activeProvider=ae,z.backendAvailable=!1}}const $={async bootstrap(){await Fn()},getRuntime(){return{...z,mode:z.activeProvider}},auth:{async login(t){return _.auth.login(t)},async register(t){return _.auth.register(t)}},problems:{async list(t={}){return _.problems.list(t)},async get(t){return _.problems.get(t)},async tags(){return _.problems.tags()}},submissions:{async start(t,e="python"){return _.submissions.start(t,e)},async run(t){return _.submissions.run(t)},async submit(t){return _.submissions.submit(t)},async sendEvents(t,e=[]){return _.submissions.sendEvents(t,e)}},leaderboard:{async get(t={}){return _.leaderboard.get(t)}},profile:{async me(){return _.profile.me()},async submissions(){return _.profile.submissions()}}};async function mt(t){const e={problems:[],tags:[],search:"",difficulty:"all",tag:"all"};t.innerHTML=`
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">
          <span class="text-brand">Riw</span>log Challenges
        </h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto">
          Resuelve problemas por etapas y demuestra tu proceso, no solo el resultado final.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-5">
        <label for="search-input" class="sr-only">Buscar problemas</label>
        <input id="search-input" type="search"
               placeholder="Buscar problema..."
               aria-label="Buscar problemas por título"
               class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition" />

        <label for="difficulty-select" class="sr-only">Filtrar por dificultad</label>
        <select id="difficulty-select" aria-label="Filtrar por dificultad" class="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-brand transition">
          <option value="all">Todas las dificultades</option>
          <option value="1">Easy</option>
          <option value="2">Medium</option>
          <option value="3">Hard</option>
        </select>

        <label for="tag-select" class="sr-only">Filtrar por tag</label>
        <select id="tag-select" aria-label="Filtrar por tag" class="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-brand transition">
          <option value="all">Todos los tags</option>
        </select>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p id="results-label" class="text-sm text-zinc-500" aria-live="polite"></p>
        <a href="#/leaderboard" class="text-sm text-brand hover:text-brand-dark transition">Ver ranking global</a>
      </div>

      <div id="problem-list" class="grid gap-3">
        ${le()}
      </div>
    </div>
  `;const s=t.querySelector("#problem-list"),r=t.querySelector("#results-label"),n=t.querySelector("#search-input"),i=t.querySelector("#difficulty-select"),a=t.querySelector("#tag-select");try{const[d,p]=await Promise.all([$.problems.list(),$.problems.tags()]);e.problems=d,e.tags=p,a.innerHTML=['<option value="all">Todos los tags</option>',...p.map(h=>`<option value="${h}">${h}</option>`)].join(""),u()}catch(d){s.innerHTML=`
      <div class="text-center py-12 text-zinc-500">
        <p class="text-lg mb-2">Error al cargar problemas</p>
        <p class="text-sm">${d.message}</p>
      </div>
    `,r.textContent="";return}const o=d=>{e.search=d.target.value,u()},c=d=>{e.difficulty=d.target.value,u()},l=d=>{e.tag=d.target.value,u()};n.addEventListener("input",o),i.addEventListener("change",c),a.addEventListener("change",l);function u(){const d=e.problems.filter(p=>{const h=e.difficulty==="all"||String(p.difficulty)===String(e.difficulty),m=e.tag==="all"||p.tags.some(x=>x.toLowerCase()===e.tag.toLowerCase()),f=!e.search||p.title.toLowerCase().includes(e.search.trim().toLowerCase());return h&&m&&f});if(r.textContent=`Mostrando ${d.length} de ${e.problems.length} problemas`,!d.length){s.innerHTML=`
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/40">
          <p class="text-lg mb-2">Sin resultados con los filtros actuales</p>
          <p class="text-sm">Prueba con otra dificultad, tag o término de búsqueda.</p>
        </div>
      `;return}s.innerHTML=d.map(p=>Vs(p)).join("")}return()=>{n.removeEventListener("input",o),i.removeEventListener("change",c),a.removeEventListener("change",l)}}const Un="modulepreload",Vn=function(t){return"/"+t},ft={},Z=function(e,s,r){let n=Promise.resolve();if(s&&s.length>0){let l=function(u){return Promise.all(u.map(d=>Promise.resolve(d).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};var a=l;document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=o?.nonce||o?.getAttribute("nonce");n=l(s.map(u=>{if(u=Vn(u),u in ft)return;ft[u]=!0;const d=u.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${p}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":Un,d||(h.as="script"),h.crossOrigin="",h.href=u,c&&h.setAttribute("nonce",c),document.head.appendChild(h),d)return new Promise((m,f)=>{h.addEventListener("load",m),h.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${u}`)))})}))}function i(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return n.then(o=>{for(const c of o||[])c.status==="rejected"&&i(c.reason);return e().catch(i)})};function Gn(t,e=0,s={}){return`
    <div class="flex items-center gap-1 p-3 bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto" role="group" aria-label="Progreso por etapas">
      ${t.map((n,i)=>{const a=s[n.id];let o="bg-zinc-700",c=String(n.stage_index);a&&(o=a.passed?"passed":"failed",c=a.passed?"✓":"✕");const l=n.stage_index===e?"active":"",u=i<t.length-1&&a?.passed?"bg-green-500/60":"bg-zinc-700";return`
        <div class="flex items-center gap-1.5">
          <button class="stage-dot ${o} ${l} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-600 text-white cursor-pointer"
                  data-stage-index="${n.stage_index}"
                  data-stage-id="${n.id}"
                  aria-label="Ir a etapa ${n.stage_index}"
                  aria-current="${l?"step":"false"}"
                  title="Stage ${n.stage_index}">
            ${c}
          </button>
          ${i<t.length-1?`<div class="w-6 h-0.5 rounded-full ${u}"></div>`:""}
        </div>
      `}).join("")}
    </div>
  `}function gt(t=null,e=!1){if(e)return`
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-5 h-5 border-2 border-zinc-600 border-t-brand rounded-full animate-spin"></div>
          <span class="text-sm text-zinc-400">Ejecutando tests...</span>
        </div>
      </div>
    `;if(!t)return`
      <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p class="text-sm text-zinc-500 text-center">
          Ejecuta tu código para ver resultados de la etapa actual.
        </p>
      </div>
    `;const s=t.passed?"text-green-400":"text-red-400",r=t.passed?"Stage Passed":"Stage Failed",n=(t.visible_results||[]).map((o,c)=>`
      <div class="flex items-center justify-between py-1.5 px-2 rounded ${o.passed?"bg-green-500/5":"bg-red-500/5"}">
        <span class="text-xs ${o.passed?"text-green-400":"text-red-400"}">
          Test ${c+1}: ${o.passed?"Passed":"Failed"}
        </span>
        ${!o.passed&&o.error?`<span class="text-xs text-zinc-500">${o.error}</span>`:""}
      </div>
    `).join(""),i=t.classification?.label==="human"?"Human":t.classification?.label==="assisted"?"Assisted":t.classification?.label==="ai_generated"?"AI Generated":null,a=i?`
      <div class="mt-3 pt-3 border-t border-zinc-800">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-500">Proceso detectado:</span>
          <span class="px-2 py-0.5 rounded-full ${t.classification.label==="human"?"bg-green-500/10 text-green-400":t.classification.label==="assisted"?"bg-yellow-500/10 text-yellow-400":"bg-red-500/10 text-red-400"}">
            ${i} (${Math.round((t.classification.confidence||0)*100)}%)
          </span>
        </div>
      </div>
    `:"";return`
    <div class="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-3">
      <div class="flex items-center justify-between">
        <div class="${s}">
          <span class="font-semibold text-sm">${r}</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-brand">${Number(t.stage_score||0).toFixed(1)}</div>
          <div class="text-[10px] text-zinc-500">Score</div>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs text-zinc-400">
        <span>⏱ ${t.runtime_ms||0}ms</span>
        <span>Stage ${t.stage_index||"-"}</span>
      </div>

      <div class="space-y-1">${n||'<p class="text-xs text-zinc-500">Sin tests visibles para esta etapa.</p>'}</div>

      ${a}
    </div>
  `}class Zn{constructor(e,s){this.submissionId=e,this.stageId=s,this.events=[],this.flushCallback=null,this.destroyed=!1,this.autoFlushTimer=window.setInterval(()=>{this._autoFlush()},4e3)}setSubmission(e){this.submissionId=e}setStage(e){this.stageId=e}onKey(e=1){this._push("key",{char_count:Math.max(1,Number(e)||1)})}onPaste(e=1){this._push("paste",{char_count:Math.max(1,Number(e)||1)})}onDelete(e=1){this._push("delete",{char_count:Math.max(1,Number(e)||1)})}onRun(e="run"){this._push("run",{mode:e})}onFocusChange(e){this._push("focus",{focused:!!e})}onFlush(e){this.flushCallback=e}flush(){if(!this.events.length)return[];const e=this.events.map(s=>({...s}));return this.events=[],e}destroy(){this.destroyed=!0,window.clearInterval(this.autoFlushTimer),this.events=[],this.flushCallback=null}_push(e,s={}){this.destroyed||this.events.push({type:e,stage_id:this.stageId,submission_id:this.submissionId,timestamp:new Date().toISOString(),...s})}async _autoFlush(){if(this.destroyed||!this.flushCallback||!this.events.length)return;const e=this.flush();try{await this.flushCallback(e)}catch{this.events.unshift(...e)}}}async function Wn(t,{slug:e}){const s={problem:null,stages:[],activeStageIndex:0,stageResults:{},language:"python",submissionId:null,tracker:null,editorView:null,editorCleanupFns:[],draftSaveTimer:null,isRunning:!1,activePanel:"results",cleanupFns:[]};let r=!1;t.innerHTML=le("lg");const n=()=>{r=!0,s.cleanupFns.forEach(i=>{try{i()}catch{}}),s.cleanupFns=[],Xt(s),s.draftSaveTimer&&(window.clearTimeout(s.draftSaveTimer),s.draftSaveTimer=null),s.tracker&&(s.tracker.destroy(),s.tracker=null),s.editorView?.destroy&&(s.editorView.destroy(),s.editorView=null)};try{const i=await $.problems.get(e);if(r||(s.problem=i,s.stages=Array.isArray(i.stages)?i.stages:[],s.language=Object.keys(i.starter_code||i.starterCode||{python:""})[0]||"python",Kn(t,s),await Jt(s),r)||(await Qt(t,s,es(s.problem,s.language)),r))return n;Jn(t,s),Yt(t,s),Fe(t,s),ne(t,s),Yn(t,s),I(t,s)}catch(i){r||(t.innerHTML=`
        <div class="flex items-center justify-center h-[60vh] px-4">
          <div class="text-center text-zinc-500">
            <p class="text-lg mb-2">Error al cargar problema</p>
            <p class="text-sm">${i.message}</p>
          </div>
        </div>
      `)}return n}function Kn(t,e){const s=Bt(e.problem.difficulty),r=Ot(e.problem.statement_md||""),n=Object.keys(e.problem.starter_code||e.problem.starterCode||{});t.innerHTML=`
    <div class="h-[calc(100vh-3.5rem)] flex flex-col">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div class="flex items-center gap-3">
          <a href="#/problems" class="text-zinc-500 hover:text-white transition" aria-label="Volver a problemas">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <h1 class="font-semibold text-white">${e.problem.title}</h1>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${s.class}">${s.label}</span>
        </div>
        <div id="stage-bar-container" class="max-w-full"></div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section class="w-full lg:w-[42%] lg:border-r border-zinc-800 overflow-y-auto max-h-[38vh] lg:max-h-none">
          <div class="p-6">
            <div class="prose-content mb-6">${r}</div>

            <div id="stage-prompt" class="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4"></div>
            <div id="visible-tests"></div>
          </div>
        </section>

        <section class="flex-1 flex flex-col min-w-0">
          <div class="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
            <div class="flex items-center gap-2">
              <select id="lang-select" class="bg-zinc-800 text-zinc-300 text-sm px-2 py-1 rounded border border-zinc-700">
                ${n.map(i=>`<option value="${i}" ${i===e.language?"selected":""}>${ss(i)}</option>`).join("")}
              </select>
              <button id="btn-reset" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition" title="Reiniciar código">
                Reset
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-run" class="px-4 py-1.5 rounded-md text-sm bg-zinc-700 text-white hover:bg-zinc-600 transition font-medium">
                Run
              </button>
              <button id="btn-submit" class="px-4 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium">
                Submit
              </button>
            </div>
          </div>

          <div id="code-editor" class="flex-1 overflow-hidden bg-zinc-950"></div>

          <div class="h-[38%] border-t border-zinc-800 flex flex-col min-h-[200px]">
            <div class="px-3 pt-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center gap-2" role="tablist" aria-label="Panel de resultados y casos de prueba">
              <button id="tab-results" role="tab" aria-selected="true" aria-controls="results-panel" data-panel="results" class="px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200">Resultados</button>
              <button id="tab-cases" role="tab" aria-selected="false" aria-controls="cases-panel" data-panel="cases" class="px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300">Test Cases</button>
            </div>

            <div id="results-panel" role="tabpanel" aria-live="polite" class="flex-1 overflow-y-auto p-3"></div>
            <div id="cases-panel" role="tabpanel" class="hidden flex-1 overflow-y-auto p-3"></div>
          </div>
        </section>
      </div>
    </div>
  `}function Jn(t,e){const s=t.querySelector("#btn-run"),r=t.querySelector("#btn-submit"),n=t.querySelector("#btn-reset"),i=t.querySelector("#lang-select"),a=t.querySelector("#stage-bar-container"),o=t.querySelector("#tab-results"),c=t.querySelector("#tab-cases"),l=async()=>{if(e.isRunning)return;const f=J(e);if(f){e.isRunning=!0,me(t,!0,"run"),I(t,e,null,!0),e.tracker?.onRun("run");try{const x=Re(t,e);Q(e.problem.id,e.language,x);const y=await bt(e,f.id,x);e.stageResults[f.id]={passed:y.passed,result:y},ne(t,e),I(t,e,y,!1),y.passed?E(`Stage ${f.stage_index} passed`,"success"):E(`Stage ${f.stage_index} failed`,"error")}catch(x){E(x.message,"error"),I(t,e,null,!1)}finally{e.isRunning=!1,me(t,!1)}}},u=async()=>{if(e.isRunning)return;e.isRunning=!0,me(t,!0,"submit"),I(t,e,null,!0),e.tracker?.onRun("submit");const f=e.activeStageIndex;try{const x=Re(t,e);Q(e.problem.id,e.language,x);let y=null;for(let j=0;j<e.stages.length;j+=1){const B=e.stages[j];if(e.tracker?.setStage(B.id),y=await bt(e,B.id,x),e.stageResults[B.id]={passed:y.passed,result:y},ne(t,e),!y.passed)break}const A=await $.submissions.submit(e.submissionId);e.activeStageIndex=f,e.tracker?.setStage(J(e)?.id),Fe(t,e),I(t,e,y,!1),A.verdict==="accepted"?(xt(e.problem.id,e.language),E(`Accepted. Score final: ${A.final_score}`,"success",5e3)):E(`Submission incompleta. Score final: ${A.final_score}`,"error",5e3)}catch(x){E(x.message,"error"),I(t,e,null,!1)}finally{e.isRunning=!1,me(t,!1)}},d=()=>{const f=ts(e.problem,e.language);xt(e.problem.id,e.language),Qn(t,e,f),E("Código reiniciado","info")},p=async f=>{if(e.isRunning)return;const x=Re(t,e);Q(e.problem.id,e.language,x),e.language=f.target.value,e.stageResults={};try{await Jt(e),await Qt(t,e,es(e.problem,e.language)),ne(t,e),I(t,e,null,!1),E(`Lenguaje cambiado a ${ss(e.language)}`,"info")}catch(y){E(y.message,"error")}},h=f=>{const x=f.target.closest("[data-stage-index]");if(!x)return;const y=Number(x.dataset.stageIndex)-1;if(y<0||y>=e.stages.length)return;e.activeStageIndex=y;const A=J(e);e.tracker?.setStage(A?.id),ne(t,e),Fe(t,e),I(t,e)},m=f=>{const x=f.currentTarget.dataset.panel;e.activePanel=x,Yt(t,e)};s?.addEventListener("click",l),r?.addEventListener("click",u),n?.addEventListener("click",d),i?.addEventListener("change",p),a?.addEventListener("click",h),o?.addEventListener("click",m),c?.addEventListener("click",m),e.cleanupFns.push(()=>s?.removeEventListener("click",l)),e.cleanupFns.push(()=>r?.removeEventListener("click",u)),e.cleanupFns.push(()=>n?.removeEventListener("click",d)),e.cleanupFns.push(()=>i?.removeEventListener("change",p)),e.cleanupFns.push(()=>a?.removeEventListener("click",h)),e.cleanupFns.push(()=>o?.removeEventListener("click",m)),e.cleanupFns.push(()=>c?.removeEventListener("click",m))}async function Jt(t){const e=await $.submissions.start(t.problem.id,t.language);t.submissionId=e.submission_id;const s=J(t);if(!t.tracker){t.tracker=new Zn(t.submissionId,s?.id),t.tracker.onFlush(async r=>{await $.submissions.sendEvents(t.submissionId,r)});return}t.tracker.setSubmission(t.submissionId),t.tracker.setStage(s?.id)}async function Qt(t,e,s){const r=t.querySelector("#code-editor");if(r){Xt(e),e.editorView?.destroy&&(e.editorView.destroy(),e.editorView=null),r.innerHTML="";try{const[{EditorView:n,basicSetup:i},{EditorState:a},{oneDark:o},{ViewPlugin:c},l,u]=await Promise.all([Z(()=>import("./index-DulzCsgm.js"),__vite__mapDeps([0,1,2,3,4])),Z(()=>import("./index-Cs5oz2oJ.js"),[]),Z(()=>import("./index-BdXT-s3j.js"),__vite__mapDeps([5,1,2,3])),Z(()=>import("./index-BN5dEhzL.js").then(x=>x.u),__vite__mapDeps([1,2])),Z(()=>import("./index-YW5LWHLd.js"),__vite__mapDeps([6,7,3,2,1,4])),Z(()=>import("./index-BDAPDKU_.js"),__vite__mapDeps([8,7,3,2,1,4]))]),d=e.language==="python"?l.python():u.javascript(),p=c.define(()=>({update(x){if(!x.docChanged)return;const y=x.state.doc.toString();if(vt(e,y),!!e.tracker)for(const A of x.transactions)A.changes.iterChanges((j,B,st,ue,q)=>{const Y=B-j,O=q.toString().length;if(Y>0&&O>0){O>10?e.tracker.onPaste(O):e.tracker.onKey(O),Y>5&&e.tracker.onDelete(Y);return}if(Y>0){e.tracker.onDelete(Y);return}O>0&&(O>10?e.tracker.onPaste(O):e.tracker.onKey(O))})}})),h=a.create({doc:s,extensions:[i,o,d,p]});e.editorView=new n({state:h,parent:r});const m=()=>e.tracker?.onFocusChange(!0),f=()=>e.tracker?.onFocusChange(!1);r.addEventListener("focusin",m),r.addEventListener("focusout",f),e.editorCleanupFns.push(()=>r.removeEventListener("focusin",m)),e.editorCleanupFns.push(()=>r.removeEventListener("focusout",f))}catch{r.innerHTML=`
      <textarea id="code-textarea"
        class="w-full h-full bg-zinc-950 text-zinc-100 font-mono text-sm p-4 resize-none outline-none border-none"
        spellcheck="false">${s}</textarea>
    `;const n=r.querySelector("#code-textarea"),i=a=>{vt(e,a.target.value)};n?.addEventListener("input",i),e.editorCleanupFns.push(()=>n?.removeEventListener("input",i))}}}async function bt(t,e,s){const r=t.tracker?t.tracker.flush():[];return $.submissions.run({submission_id:t.submissionId,stage_id:e,code:s,events:r})}function Re(t,e){return e.editorView?e.editorView.state.doc.toString():t.querySelector("#code-textarea")?.value||""}function Qn(t,e,s){if(e.editorView){e.editorView.dispatch({changes:{from:0,to:e.editorView.state.doc.length,insert:s}}),Q(e.problem.id,e.language,s);return}const r=t.querySelector("#code-textarea");r&&(r.value=s,Q(e.problem.id,e.language,s))}function ne(t,e){const s=t.querySelector("#stage-bar-container");s&&(s.innerHTML=Gn(e.stages,e.activeStageIndex+1,e.stageResults))}function Fe(t,e){const s=J(e);if(!s)return;const r=t.querySelector("#stage-prompt"),n=t.querySelector("#visible-tests");r&&(r.innerHTML=`
      <h4 class="text-sm font-semibold text-brand mb-2">Stage ${s.stage_index}</h4>
      <div class="prose-content text-sm">${Ot(s.prompt_md||"")}</div>
    `),n&&(n.innerHTML=er(s))}function I(t,e,s=null,r=!1){const n=t.querySelector("#results-panel");if(!n)return;if(r){n.innerHTML=gt(null,!0);return}const i=J(e),a=i?e.stageResults[i.id]?.result:null;n.innerHTML=gt(s||a||null,!1)}function Yn(t,e){const s=t.querySelector("#cases-panel");s&&(s.innerHTML=e.stages.map(r=>`
      <div class="mb-4 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <h4 class="text-sm font-semibold text-zinc-200 mb-2">Stage ${r.stage_index}</h4>

        ${(r.visible_tests||[]).map((n,i)=>`
          <div class="mb-2 rounded-md border border-zinc-700 bg-zinc-800/40 p-3 text-xs font-mono">
            <p class="text-zinc-400">Input: <span class="text-zinc-200">${n.input_text}</span></p>
            <p class="text-zinc-400">Expected: <span class="text-green-400">${n.expected_text}</span></p>
            <p class="text-zinc-500 mt-1">Test visible ${i+1}</p>
          </div>
        `).join("")}

        <p class="text-xs text-zinc-500">+ ${r.hidden_count||0} hidden tests</p>
      </div>
    `).join(""))}function Yt(t,e){const s=t.querySelector("#results-panel"),r=t.querySelector("#cases-panel"),n=t.querySelector("#tab-results"),i=t.querySelector("#tab-cases");if(!s||!r||!n||!i)return;const a=e.activePanel==="results";s.classList.toggle("hidden",!a),r.classList.toggle("hidden",a),n.className=a?"px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200":"px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300",i.className=a?"px-3 py-1.5 text-xs rounded-t-md text-zinc-500 hover:text-zinc-300":"px-3 py-1.5 text-xs rounded-t-md bg-zinc-800 text-zinc-200",n.setAttribute("aria-selected",a?"true":"false"),i.setAttribute("aria-selected",a?"false":"true")}function me(t,e,s="run"){const r=t.querySelector("#btn-run"),n=t.querySelector("#btn-submit");r&&(r.disabled=e,r.textContent=e&&s==="run"?"Running...":"Run"),n&&(n.disabled=e,n.textContent=e&&s==="submit"?"Submitting...":"Submit")}function J(t){return t.stages[t.activeStageIndex]||null}function Xt(t){t.editorCleanupFns.forEach(e=>{try{e()}catch{}}),t.editorCleanupFns=[]}function tt(t,e){return`Riwlog_draft_${t}_${e}`}function Q(t,e,s){typeof window>"u"||window.localStorage.setItem(tt(t,e),String(s||""))}function Xn(t,e){return typeof window>"u"?null:window.localStorage.getItem(tt(t,e))}function xt(t,e){typeof window>"u"||window.localStorage.removeItem(tt(t,e))}function vt(t,e){t.draftSaveTimer&&window.clearTimeout(t.draftSaveTimer),t.draftSaveTimer=window.setTimeout(()=>{Q(t.problem.id,t.language,e)},300)}function es(t,e){const s=Xn(t.id,e);return s!==null&&s.trim().length>0?s:ts(t,e)}function ts(t,e){const s=t.starter_code||t.starterCode||{};return s[e]||s.python||s.javascript||`# Escribe tu solución aquí
`}function ss(t){return t==="python"?"Python":t==="javascript"?"JavaScript":t==="typescript"?"TypeScript":t.charAt(0).toUpperCase()+t.slice(1)}function er(t){return!t||!t.visible_tests?.length?'<p class="text-sm text-zinc-500">No hay tests visibles para esta etapa.</p>':`
    <h4 class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Visible tests</h4>
    ${t.visible_tests.map((e,s)=>`
      <div class="mb-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p class="text-xs font-semibold text-zinc-400 mb-1">Test ${s+1}</p>
        <div class="text-xs font-mono">
          <p class="text-zinc-500">Input: <span class="text-zinc-300">${e.input_text}</span></p>
          <p class="text-zinc-500">Expected: <span class="text-green-400">${e.expected_text}</span></p>
        </div>
      </div>
    `).join("")}
    <p class="text-xs text-zinc-500">+ ${t.hidden_count||0} hidden tests</p>
  `}const tr=[{id:"today",label:"Hoy"},{id:"week",label:"Semana"},{id:"all",label:"All Time"}];function sr(t){return t?"px-3 py-1.5 rounded-md text-xs bg-brand text-white":"px-3 py-1.5 rounded-md text-xs text-zinc-400 bg-zinc-800 hover:text-white"}async function nr(t){const e={timeframe:"all",entries:[]};t.innerHTML=`
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-white">Top Thinkers</h1>
          <p class="mt-1 text-zinc-400">Ranking por score acumulado y constancia.</p>
        </div>
        <div id="filter-buttons" class="flex items-center gap-2" role="tablist" aria-label="Filtro de tiempo"></div>
      </div>

      <div id="leaderboard-content">${le("lg")}</div>
    </div>
  `;const s=t.querySelector("#filter-buttons"),r=t.querySelector("#leaderboard-content");let n=!1;const i=()=>{s.innerHTML=tr.map(l=>{const u=l.id===e.timeframe;return`<button data-filter="${l.id}" role="tab" aria-selected="${u?"true":"false"}" aria-pressed="${u?"true":"false"}" class="${sr(u)}">${l.label}</button>`}).join("")},a=()=>{if(!e.entries.length){r.innerHTML=`
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
          <p class="text-lg mb-2">Sin actividad en este rango</p>
          <p class="text-sm">Vuelve a intentar con otro filtro.</p>
        </div>
      `;return}const l=e.entries.slice(0,3),u=e.entries.slice(3),d=`
      <div class="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${l.map((h,m)=>`
              <div class="${m===0?"sm:order-2":m===1?"sm:order-1":"sm:order-3"} relative overflow-hidden rounded-xl border bg-gradient-to-b ${m===0?"from-yellow-500/20 to-yellow-500/5 border-yellow-500/30":m===1?"from-zinc-400/20 to-zinc-400/5 border-zinc-400/30":"from-amber-700/20 to-amber-700/5 border-amber-700/30"} p-6">
                <div class="flex flex-col items-center text-center">
                  <div class="w-16 h-16 rounded-full bg-zinc-900/70 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white mb-3">
                    ${h.avatar||h.username[0].toUpperCase()}
                  </div>
                  <h3 class="text-sm font-semibold text-zinc-100">${h.username}</h3>
                  <p class="text-2xl font-bold tabular-nums mt-2 text-white">${h.score.toLocaleString()}</p>
                  <div class="mt-2 flex items-center gap-3 text-xs text-zinc-300">
                    <span>${h.solved} solved</span>
                    <span>${h.streak}d streak</span>
                  </div>
                </div>
              </div>
            `).join("")}
      </div>
    `,p=`
      <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div class="hidden sm:grid grid-cols-[56px_1fr_120px_90px_90px] items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span class="text-center">Rank</span>
          <span>User</span>
          <span class="text-right">Score</span>
          <span class="text-right">Solved</span>
          <span class="text-right">Streak</span>
        </div>
        ${u.map((h,m)=>`
          <div class="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 sm:grid sm:grid-cols-[56px_1fr_120px_90px_90px] sm:gap-4 ${m===u.length-1?"border-b-0":""}">
            <span class="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center sm:mx-auto">${h.rank}</span>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-brand/20 text-brand text-xs font-bold flex items-center justify-center">${h.avatar||h.username[0].toUpperCase()}</div>
              <span class="text-sm text-zinc-100">${h.username}</span>
            </div>
            <span class="ml-auto sm:ml-0 text-right text-sm font-semibold tabular-nums text-zinc-100">${h.score.toLocaleString()}</span>
            <span class="hidden sm:block text-right text-sm text-zinc-400">${h.solved}</span>
            <span class="hidden sm:block text-right text-sm text-zinc-400">${h.streak}d</span>
          </div>
        `).join("")}
      </div>
      <p class="text-center text-sm text-zinc-500 mt-4">Mostrando ${e.entries.length} usuarios</p>
    `;r.innerHTML=`${d}${p}`},o=async()=>{r.innerHTML=le("lg");try{const l=await $.leaderboard.get({timeframe:e.timeframe});if(n)return;e.entries=l,a()}catch(l){if(n)return;r.innerHTML=`
        <div class="text-center py-12 text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
          <p class="text-lg mb-2">Error al cargar leaderboard</p>
          <p class="text-sm">${l.message}</p>
        </div>
      `}},c=l=>{const u=l.target.closest("[data-filter]");u&&(e.timeframe=u.dataset.filter,i(),o())};return s.addEventListener("click",c),i(),await o(),()=>{n=!0,s.removeEventListener("click",c)}}const wt={accepted:{label:"Accepted",color:"text-green-400 bg-green-500/10"},wrong_answer:{label:"Wrong Answer",color:"text-red-400 bg-red-500/10"},pending:{label:"Pending",color:"text-yellow-400 bg-yellow-500/10"}};function yt(t){const e=new Date(t);return Number.isNaN(e.getTime())?"-":e.toLocaleDateString("es-CO",{month:"short",day:"numeric",year:"numeric"})}async function rr(t){t.innerHTML=le("lg");try{const[e,s]=await Promise.all([$.profile.me(),$.profile.submissions()]);ir(t,e,s)}catch(e){t.innerHTML=`
      <div class="flex items-center justify-center h-[60vh] text-zinc-500 px-4">
        <div class="text-center">
          <p class="text-lg mb-2">No se pudo cargar el perfil</p>
          <p class="text-sm">${e.message}</p>
        </div>
      </div>
    `}}function ir(t,e,s){const r=e.user,n=e.stats,i=150,a=Math.min(100,Math.round(n.solved/i*100));t.innerHTML=`
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div class="w-20 h-20 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-2xl font-bold text-brand">
          ${(r.username||"?")[0].toUpperCase()}
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-zinc-100">${r.display_name||r.username}</h1>
          <div class="mt-2 flex flex-wrap gap-4 text-sm text-zinc-400">
            <span>${r.email}</span>
            <span>Joined ${yt(r.created_at)}</span>
            <span>Rank #${e.rank||"-"}</span>
            <span>${e.streak||0}d streak</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold tabular-nums text-zinc-100">${n.total_score.toLocaleString()}</span>
          <span class="text-sm text-zinc-500">pts</span>
        </div>
      </div>

      <div class="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Problemas resueltos</p>
          <p class="mt-1 text-3xl font-bold text-zinc-100">${n.solved}</p>
          <p class="text-xs text-zinc-500">de ${i}</p>
          <div class="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div class="h-full bg-brand" style="width:${a}%"></div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Por dificultad</p>
          <div class="mt-2 space-y-2 text-sm">
            <div class="flex items-center justify-between"><span class="text-green-400">Easy</span><span class="text-zinc-200">${n.by_difficulty.easy}</span></div>
            <div class="flex items-center justify-between"><span class="text-yellow-400">Medium</span><span class="text-zinc-200">${n.by_difficulty.medium}</span></div>
            <div class="flex items-center justify-between"><span class="text-red-400">Hard</span><span class="text-zinc-200">${n.by_difficulty.hard}</span></div>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p class="text-sm text-zinc-500">Actividad</p>
          <p class="mt-1 text-3xl font-bold text-zinc-100">${s.length}</p>
          <p class="text-xs text-zinc-500">submissions registradas</p>
          <p class="mt-3 text-sm text-zinc-400">Racha actual: <span class="text-brand">${e.streak||0} días</span></p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-lg font-semibold text-zinc-100 mb-4">Badges</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          ${(e.badges||[]).map(o=>`
            <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center hover:border-zinc-700 transition">
              <p class="text-sm font-semibold text-zinc-100">${o.name}</p>
              <p class="text-[11px] text-zinc-500 mt-1">${o.description}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-zinc-100 mb-4">Recent Submissions</h2>
        <div class="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div class="hidden sm:grid grid-cols-[1fr_130px_95px_90px_100px] items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <span>Problem</span>
            <span>Status</span>
            <span class="text-right">Lenguaje</span>
            <span class="text-right">Score</span>
            <span class="text-right">Fecha</span>
          </div>

          ${s.length?s.map((o,c)=>{const l=wt[o.verdict]||wt.pending;return`
                    <div class="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_130px_95px_90px_100px] sm:items-center sm:gap-4 px-4 py-3 border-b border-zinc-800 ${c===s.length-1?"border-b-0":""}">
                      <a href="#/problem/${o.problem_id}" class="text-sm font-medium text-zinc-100 hover:text-brand transition">
                        ${o.problem_title||o.problem_id}
                      </a>
                      <div>
                        <span class="inline-flex px-2 py-1 rounded-full text-xs ${l.color}">${l.label}</span>
                      </div>
                      <span class="sm:text-right text-xs text-zinc-400 uppercase">${o.language}</span>
                      <span class="sm:text-right text-sm font-semibold text-zinc-200">${o.final_score}</span>
                      <span class="sm:text-right text-xs text-zinc-500">${yt(o.submitted_at)}</span>
                    </div>
                  `}).join(""):'<p class="text-center text-zinc-500 py-8">Aún no tienes submissions</p>'}
        </div>
      </div>
    </div>
  `}const Ae="Riwlog_token",Ce="Riwlog_user",fe="Riwlog_expires_at",Pe=720*60*1e3,W=new Map;function Ie(t){if(typeof t!="string")return!1;const e=t.trim();return!(e.length<16||/\s/.test(e))}function kt(t){if(!t||typeof t!="object")return null;const e=typeof t.id=="string"?t.id:null,s=typeof t.username=="string"?t.username:null,r=typeof t.email=="string"?t.email:null;return!e||!s||!r?null:{id:e,username:s,email:r,display_name:typeof t.display_name=="string"&&t.display_name.trim().length>0?t.display_name:s,created_at:typeof t.created_at=="string"&&t.created_at.trim().length>0?t.created_at:new Date().toISOString()}}function ar(t){if(typeof t!="string"||!t.trim())return null;const e=new Date(t).getTime();return Number.isNaN(e)?null:new Date(e).toISOString()}const P={_auth:null,setAuth(t,e,s={}){const r=Number(s.ttlMs||Pe),n=kt(e);if(!Ie(t))throw new Error("Token de sesión inválido.");if(!n)throw new Error("Datos de usuario inválidos.");const i=new Date(Date.now()+Math.max(6e4,r)).toISOString();this._auth={token:t.trim(),user:n,expires_at:i},localStorage.setItem(Ae,this._auth.token),localStorage.setItem(Ce,JSON.stringify(n)),localStorage.setItem(fe,i),this.emit("auth-change",this.getSessionMeta())},logout(t={}){this._auth=null,localStorage.removeItem(Ae),localStorage.removeItem(Ce),localStorage.removeItem(fe),t.silent||this.emit("auth-change",null)},loadSession(){const t=localStorage.getItem(Ae),e=localStorage.getItem(Ce),s=localStorage.getItem(fe);if(!t||!e||!s){this.logout({silent:!0});return}const r=ar(s);if(!r||new Date(r).getTime()<=Date.now()){this.logout({silent:!0});return}let n=null;try{n=JSON.parse(e)}catch{this.logout({silent:!0});return}const i=kt(n);if(!i||!Ie(t)){this.logout({silent:!0});return}this._auth={token:t,user:i,expires_at:r}},extendSession(t=Pe){if(!this._auth)return;const e=new Date(Date.now()+Math.max(6e4,Number(t||Pe))).toISOString();this._auth.expires_at=e,localStorage.setItem(fe,e)},isAuthenticated(){if(!this._auth||!this._auth.expires_at)return!1;const t=new Date(this._auth.expires_at).getTime();return Number.isNaN(t)||t<=Date.now()?(this.logout(),!1):Ie(this._auth.token)},getToken(){return this.isAuthenticated()?this._auth.token:null},getUser(){return this.isAuthenticated()?this._auth.user:null},getSessionMeta(){return this._auth?{expires_at:this._auth.expires_at,user_id:this._auth.user?.id||null}:null},on(t,e){W.has(t)||W.set(t,[]),W.get(t).push(e)},off(t,e){const s=W.get(t);s&&W.set(t,s.filter(r=>r!==e))},emit(t,e){const s=W.get(t);s&&s.forEach(r=>r(e))}};function or(t){if(P.isAuthenticated()){F.navigate("problems");return}t.innerHTML=`
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div class="w-full max-w-sm p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
          <p class="text-zinc-400 text-sm">Usa tu cuenta para continuar resolviendo etapas.</p>
        </div>

        <form id="login-form" class="space-y-4" novalidate>
          <div>
            <label for="login-email" class="block text-sm text-zinc-400 mb-1">Email o username</label>
            <input id="login-email" type="text" name="email" required
              autocomplete="username"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="demo@riwlog.dev" />
          </div>
          <div>
            <label for="login-password" class="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input id="login-password" type="password" name="password" required
              autocomplete="current-password"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="123456" />
          </div>

          <button type="submit" id="btn-login"
            class="w-full py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition text-sm">
            Entrar
          </button>

          <p class="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?
            <a href="#/register" class="text-brand hover:underline">Regístrate</a>
          </p>

          <p class="text-center text-xs text-zinc-600">
            Demo rápido: <span class="text-zinc-400">demo@riwlog.dev / 123456</span>
          </p>
        </form>
      </div>
    </div>
  `;const e=t.querySelector("#login-form"),s=t.querySelector("#btn-login"),r=async n=>{n.preventDefault(),s.disabled=!0,s.textContent="Entrando...";const i=new FormData(e);try{const a=await $.auth.login({email:i.get("email"),password:i.get("password")});P.setAuth(a.access_token,a.user),E("Sesión iniciada.","success"),F.navigate("problems")}catch(a){E(a.message,"error"),s.disabled=!1,s.textContent="Entrar"}};return e.addEventListener("submit",r),()=>{e.removeEventListener("submit",r)}}function lr(t){if(P.isAuthenticated()){F.navigate("problems");return}t.innerHTML=`
    <div class="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div class="w-full max-w-sm p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
          <p class="text-zinc-400 text-sm">Empieza a competir por etapas hoy.</p>
        </div>

        <form id="register-form" class="space-y-4" novalidate>
          <div>
            <label for="register-username" class="block text-sm text-zinc-400 mb-1">Username</label>
            <input id="register-username" type="text" name="username" required minlength="3" maxlength="50"
              autocomplete="username"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="tu_username" />
          </div>
          <div>
            <label for="register-email" class="block text-sm text-zinc-400 mb-1">Email</label>
            <input id="register-email" type="email" name="email" required
              autocomplete="email"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="tu@email.com" />
          </div>
          <div>
            <label for="register-password" class="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input id="register-password" type="password" name="password" required minlength="6"
              autocomplete="new-password"
              class="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand transition"
              placeholder="Mínimo 6 caracteres" />
          </div>

          <button type="submit" id="btn-register"
            class="w-full py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition text-sm">
            Registrarse
          </button>

          <p class="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?
            <a href="#/login" class="text-brand hover:underline">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `;const e=t.querySelector("#register-form"),s=t.querySelector("#btn-register"),r=async n=>{n.preventDefault(),s.disabled=!0,s.textContent="Creando cuenta...";const i=new FormData(e);try{const a=await $.auth.register({username:i.get("username"),email:i.get("email"),password:i.get("password")});P.setAuth(a.access_token,a.user),E("Cuenta creada correctamente.","success"),F.navigate("problems")}catch(a){E(a.message,"error"),s.disabled=!1,s.textContent="Registrarse"}};return e.addEventListener("submit",r),()=>{e.removeEventListener("submit",r)}}const cr=[{path:"",view:mt},{path:"problems",view:mt},{path:"problem/:slug",view:Wn,auth:!0},{path:"leaderboard",view:nr},{path:"profile",view:rr,auth:!0},{path:"login",view:or},{path:"register",view:lr}];let ye=null,_t=0;function St(){if(typeof ye=="function")try{ye()}catch{}ye=null}const F={init(){window.addEventListener("hashchange",()=>this._resolve()),this._resolve()},navigate(t){window.location.hash=`#/${t}`},refresh(){this._resolve()},_resolve(){const t=window.location.hash.slice(2)||"",e=document.getElementById("main");let s=null,r={};for(const n of cr){const i=this._match(n.path,t);if(i){s=n,r=i;break}}if(!s){St(),e.innerHTML=`
        <div class="flex items-center justify-center h-[60vh] px-4">
          <div class="text-center">
            <h1 class="text-6xl font-bold text-zinc-700 mb-4">404</h1>
            <p class="text-zinc-400 mb-6">Página no encontrada</p>
            <a href="#/" class="px-4 py-2 bg-brand rounded-lg text-white hover:bg-brand-dark transition">
              Volver al inicio
            </a>
          </div>
        </div>
      `;return}if(s.auth&&!P.isAuthenticated()){this.navigate("login");return}this._render(e,s,r)},_render(t,e,s){const r=++_t;St(),t.innerHTML="",t.classList.add("animate-fade-in"),Promise.resolve(e.view(t,s)).then(n=>{if(r!==_t){typeof n=="function"&&n();return}ye=typeof n=="function"?n:null,typeof t.focus=="function"&&t.focus()}).catch(n=>{t.innerHTML=`
          <div class="flex items-center justify-center h-[60vh] px-4">
            <div class="text-center text-zinc-500">
              <p class="text-lg mb-2">Error al renderizar la vista</p>
              <p class="text-sm">${n?.message||"Error desconocido"}</p>
            </div>
          </div>
        `}).finally(()=>{window.setTimeout(()=>{t.classList.remove("animate-fade-in")},300)})},_match(t,e){const s=t.split("/").filter(Boolean),r=e.split("/").filter(Boolean);if(s.length!==r.length)return null;const n={};for(let i=0;i<s.length;i+=1)if(s[i].startsWith(":"))n[s[i].slice(1)]=decodeURIComponent(r[i]);else if(s[i]!==r[i])return null;return n}},$t=[{path:"problems",label:"Problemas"},{path:"leaderboard",label:"Leaderboard"}];let oe=null;function ur(){const t=window.location.hash.slice(2)||"";return!t||t==="problems"||t.startsWith("problem/")?"problems":t}function ge(t,e){return t==="problems"?e==="problems":e.startsWith(t)}function be(t){return t?"px-3 py-1.5 rounded-md text-sm bg-brand/15 text-brand border border-brand/40":"px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"}function zt(t){return String(t||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function dr(t){const e=t.querySelector("#btn-menu"),s=t.querySelector("#mobile-menu");if(!e||!s){oe=null;return}const r=()=>{s.classList.add("hidden"),e.setAttribute("aria-expanded","false")},n=()=>{s.classList.contains("hidden")?(s.classList.remove("hidden"),e.setAttribute("aria-expanded","true")):r()},i=o=>{o.key==="Escape"&&r()};e.addEventListener("click",n),window.addEventListener("keydown",i);const a=[...s.querySelectorAll("a")];a.forEach(o=>o.addEventListener("click",r)),oe=()=>{e.removeEventListener("click",n),window.removeEventListener("keydown",i),a.forEach(o=>o.removeEventListener("click",r))}}function Me(){const t=document.getElementById("navbar");if(!t)return;oe&&(oe(),oe=null);const e=P.getUser(),s=P.isAuthenticated(),r=ur(),n=$.getRuntime(),i=n.activeProvider==="remote"?"API conectada":"Modo local",a=n.activeProvider==="remote"?"text-green-400 bg-green-500/10 border-green-500/30":"text-amber-300 bg-amber-500/10 border-amber-500/30";t.className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md",t.innerHTML=`
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-2 font-bold text-lg text-white hover:text-brand transition">
        <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#7c3aed"/>
          <text x="16" y="22" text-anchor="middle" font-size="16" font-weight="700" fill="white" font-family="ui-sans-serif">R</text>
        </svg>
        <span>Riwlog</span>
      </a>

      <button id="btn-menu" class="md:hidden p-2 rounded-md text-zinc-300 hover:bg-zinc-800" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <div class="hidden md:flex items-center gap-1">
        <span class="mr-2 px-2 py-0.5 rounded-full text-[11px] border ${a}">
          ${i}
        </span>
        ${$t.map(l=>`
          <a href="#/${l.path}" class="${be(ge(l.path,r))}">
            ${l.label}
          </a>
        `).join("")}

        ${s?`
          <a href="#/profile" class="${be(ge("profile",r))}">
            ${zt(e?.username||"Perfil")}
          </a>
          <button id="btn-logout" class="ml-2 px-3 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition">
            Salir
          </button>
        `:`
          <a href="#/login" class="ml-2 px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Entrar
          </a>
          <a href="#/register" class="ml-1 px-4 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium">
            Registrarse
          </a>
        `}
      </div>
    </div>

    <div id="mobile-menu" class="md:hidden hidden border-t border-zinc-800 px-4 py-3 bg-zinc-950">
      <div class="flex flex-col gap-2">
        <div class="px-3 py-1 rounded-md text-xs border ${a}">
          ${i}
        </div>
        ${$t.map(l=>`
          <a href="#/${l.path}" class="${be(ge(l.path,r))}">
            ${l.label}
          </a>
        `).join("")}

        ${s?`
          <a href="#/profile" class="${be(ge("profile",r))}">
            ${zt(e?.username||"Perfil")}
          </a>
          <button id="btn-logout-mobile" class="px-3 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition text-left">
            Salir
          </button>
        `:`
          <a href="#/login" class="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Entrar
          </a>
          <a href="#/register" class="px-3 py-1.5 rounded-md text-sm bg-brand text-white hover:bg-brand-dark transition font-medium text-center">
            Registrarse
          </a>
        `}
      </div>
    </div>
  `,dr(t);const o=t.querySelector("#btn-logout"),c=t.querySelector("#btn-logout-mobile");[o,c].forEach(l=>{l&&l.addEventListener("click",()=>{P.logout(),F.navigate("")})})}async function pr(){try{await $.bootstrap()}catch(e){const s=document.getElementById("main");s&&(s.innerHTML=`
        <section class="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 class="text-2xl font-semibold text-zinc-100 mb-3">Error de Inicialización</h1>
          <p class="text-zinc-400 mb-2">No se pudo conectar con el backend configurado.</p>
          <p class="text-sm text-zinc-500">${e?.message||"Error desconocido"}</p>
        </section>
      `);return}P.loadSession(),Me(),F.init(),P.on("auth-change",()=>{Me(),F.refresh()}),window.addEventListener("hashchange",()=>{Me()});const t=$.getRuntime();t.activeProvider==="local"&&t.configuredMode==="hybrid"&&E("Backend no disponible. Ejecutando en modo local.","info",4500)}document.addEventListener("DOMContentLoaded",()=>{pr()});const Et=document.querySelector("#app");Et&&(Et.innerHTML=`
    <a href="#main" class="skip-link">Saltar al contenido principal</a>
    <div class="min-h-screen bg-zinc-950 text-zinc-100">
      <header id="navbar" aria-label="Navegacion principal"></header>
      <main id="main" tabindex="-1" class="pb-10"></main>
      <div
        id="toast-container"
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      ></div>
    </div>
  `);
