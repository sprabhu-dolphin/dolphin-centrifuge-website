// Garden Gnome Software - Skin
// Pano2VR 6.0.2/17253
// Filename: controller_new_crudeoil.ggsk
// Generated Вт фев 12 23:45:50 2019

function pano2vrSkin(player,base) {
	var me=this;
	var skin=this;
	var flag=false;
	var skinKeyPressed = 0;
	this.player=player;
	this.player.skinObj=this;
	this.divSkin=player.divSkin;
	this.ggUserdata=player.userdata;
	this.lastSize={ w: -1,h: -1 };
	var basePath="";
	// auto detect base path
	if (base=='?') {
		var scripts = document.getElementsByTagName('script');
		for(var i=0;i<scripts.length;i++) {
			var src=scripts[i].src;
			if (src.indexOf('skin.js')>=0) {
				var p=src.lastIndexOf('/');
				if (p>=0) {
					basePath=src.substr(0,p+1);
				}
			}
		}
	} else
	if (base) {
		basePath=base;
	}
	this.elementMouseDown=[];
	this.elementMouseOver=[];
	var cssPrefix='';
	var domTransition='transition';
	var domTransform='transform';
	var prefixes='Webkit,Moz,O,ms,Ms'.split(',');
	var i;
	var hs,el,els,elo,ela,elHorScrollFg,elHorScrollBg,elVertScrollFg,elVertScrollBg,elCornerBg;
	if (typeof document.body.style['transform'] == 'undefined') {
		for(var i=0;i<prefixes.length;i++) {
			if (typeof document.body.style[prefixes[i] + 'Transform'] !== 'undefined') {
				cssPrefix='-' + prefixes[i].toLowerCase() + '-';
				domTransition=prefixes[i] + 'Transition';
				domTransform=prefixes[i] + 'Transform';
			}
		}
	}
	
	player.setMargins(0,0,0,0);
	
	this.updateSize=function(startElement) {
		var stack=[];
		stack.push(startElement);
		while(stack.length>0) {
			var e=stack.pop();
			if (e.ggUpdatePosition) {
				e.ggUpdatePosition();
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
	}
	
	this.callNodeChange=function(startElement) {
		var stack=[];
		stack.push(startElement);
		while(stack.length>0) {
			var e=stack.pop();
			if (e.ggNodeChange) {
				e.ggNodeChange();
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
	}
	player.addListener('configloaded', function() { me.callNodeChange(me.divSkin); });
	player.addListener('changenodeid', function() { me.callNodeChange(me.divSkin); });
	
	var parameterToTransform=function(p) {
		var hs='translate(' + p.rx + 'px,' + p.ry + 'px) rotate(' + p.a + 'deg) scale(' + p.sx + ',' + p.sy + ')';
		return hs;
	}
	
	this.findElements=function(id,regex) {
		var r=[];
		var stack=[];
		var pat=new RegExp(id,'');
		stack.push(me.divSkin);
		while(stack.length>0) {
			var e=stack.pop();
			if (regex) {
				if (pat.test(e.ggId)) r.push(e);
			} else {
				if (e.ggId==id) r.push(e);
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
		return r;
	}
	
	this.addSkin=function() {
		var hs='';
		this.ggCurrentTime=new Date().getTime();
		el=me._loading_image=document.createElement('div');
		els=me._loading_image__img=document.createElement('img');
		els.className='ggskin ggskin_loading_image';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="loading image";
		el.ggDx=0;
		el.ggDy=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 64px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : -10000px;';
		hs+='visibility : inherit;';
		hs+='width : 224px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._loading_image.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._loading_image.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
				var ph=this.parentNode.clientHeight;
				var h=this.offsetHeight;
					this.style.top=(this.ggDy + ph/2 - h/2) + 'px';
			}
		}
		el=me._loading_text=document.createElement('div');
		els=me._loading_text__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="loading text";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='height : 20px;';
		hs+='left : 12px;';
		hs+='position : absolute;';
		hs+='top : 14px;';
		hs+='visibility : inherit;';
		hs+='width : 200px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: 200px;';
		hs+='height: 20px;';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(0,0,0,1);';
		hs+='text-align: left;';
		hs+='white-space: nowrap;';
		hs+='padding: 0px 1px 0px 1px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		me._loading_text.ggUpdateText=function() {
			var hs="<b>Loading... "+(player.getPercentLoaded()*100.0).toFixed(0)+"%<\/b>";
			if (hs!=this.ggText) {
				this.ggText=hs;
				this.ggTextDiv.innerHTML=hs;
				if (this.ggUpdatePosition) this.ggUpdatePosition();
			}
		}
		me._loading_text.ggUpdateText();
		el.appendChild(els);
		me._loading_text.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._loading_text.ggUpdatePosition=function (useTransition) {
		}
		me._loading_image.appendChild(me._loading_text);
		el=me._loading_bar=document.createElement('div');
		el.ggId="loading bar";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_rectangle ";
		el.ggType='rectangle';
		hs ='';
		hs+='background : #4f4f4f;';
		hs+='border : 2px solid #000000;';
		hs+='cursor : default;';
		hs+='height : 10px;';
		hs+='left : 11px;';
		hs+='position : absolute;';
		hs+='top : 39px;';
		hs+='visibility : inherit;';
		hs+='width : 198px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='0% 50%';
		me._loading_bar.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._loading_bar.ggUpdatePosition=function (useTransition) {
		}
		me._loading_image.appendChild(me._loading_bar);
		el=me._loading_close=document.createElement('div');
		els=me._loading_close__img=document.createElement('img');
		els.className='ggskin ggskin_loading_close';
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACx0lEQVRIie2Vv0tbURTHv/e+5L6Xl6IPTJMQfGIM/hj8A+JmRqFgOiQxwbbUJYtLS4fSv6MSwaFCSyku6eJgqOWpiyI6REUHf4BjwDRN0oSXl3dvBysdfBGFOgg9cJczfD7cc+49hwghcJ9B75X+X3CbcDklTdPE8fExWq0WAMDtdgMArh4EIQSEEFiWdQlxuTAwMABVVa/DhBDXzv7+Piilj/r6+hLhcDgNwKsoCjRNg6ZpVyB3KBRK6br+jFL62DAMR5Zjcnd3F7quTxmGIba2tkQ8Hv8CwDM4OIiRkREAkKLRaG5hYUHkcjmh6/qbQqHgyHIsEQAwxhTOOZrNJmZnZ1OWZWF5efkFIaQ1NjY2NzMzkzVNE7ZtQ5IkdqceMMZwdnb2dX5+Pp5Opy'+
			'cbjQYymUyq3W5b9Xq9lkwms+VyGQCwubm5fn5+/uGqT7cSAADnvLK0tDRNKf0Ui8Umm80mJiYmpi3LQqVSgRACh4eHG/l8PgGgRAi5mwAAotFofXt7O2Oa5iKlNFGpVMA5h6IoUFX1287OztT4+PiFYRgdGTcKZFkGY6xxcHBQrlarqNfrAABFUeD3+38QQn7KsnwT4mbB2tqaNDQ0NOfxeLK2baOnpwdCCDQaDXDOE4qi8JWVlZcAmp0YHX8yIcTT398/5/f7s4wx9Pb2ghDy3bbtfCgUgizLUFU1FYlEFgF03ekGtm1D07Qnw8PDWUopgsEgTk9PN46OjpJCiF8APkcikae1Wg2qqiZLpdIG5/z9rQVCCFBKWTAYhKqqKBaL63t7e4lwOHwhSRJOTk6eM8Y+jo6Oxk3TBKWUdtwrTr+vWCwCgM/n870NBALvAAQA'+
			'wOv1wuv14s+T7NI07XV3d/crAP7V1VVHFnEyV6tVFAoFWJYFIQTcbvff2YK/w67dbl+WweVCLBaDz+e7xnIU/Mt4+Avn4Qt+A9nka/1nd+55AAAAAElFTkSuQmCC';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="loading close";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 24px;';
		hs+='left : 200px;';
		hs+='position : absolute;';
		hs+='top : 1px;';
		hs+='visibility : inherit;';
		hs+='width : 24px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._loading_close.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._loading_close.onclick=function (e) {
			me._loading_image.style[domTransition]='none';
			me._loading_image.style.visibility='hidden';
			me._loading_image.ggVisible=false;
		}
		me._loading_close.ggUpdatePosition=function (useTransition) {
		}
		me._loading_image.appendChild(me._loading_close);
		me.divSkin.appendChild(me._loading_image);
		el=me._toolbar=document.createElement('div');
		el.ggId="toolbar";
		el.ggDx=0.5;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_container ";
		el.ggType='container';
		hs ='';
		hs+='bottom : 6px;';
		hs+='height : 32px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='visibility : inherit;';
		hs+='width : 277px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._toolbar.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._toolbar.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		el=me._left=document.createElement('div');
		els=me._left__img=document.createElement('img');
		els.className='ggskin ggskin_left';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._left__img.ggOverSrc=hs;
		el.ggId="left";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 0px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._left.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._left.onmouseover=function (e) {
			me._left__img.src=me._left__img.ggOverSrc;
		}
		me._left.onmouseout=function (e) {
			me._left__img.src=me._left__img.ggNormalSrc;
			me.elementMouseDown['left']=false;
		}
		me._left.onmousedown=function (e) {
			me.elementMouseDown['left']=true;
		}
		me._left.onmouseup=function (e) {
			me.elementMouseDown['left']=false;
		}
		me._left.ontouchend=function (e) {
			me.elementMouseDown['left']=false;
		}
		me._left.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._left);
		el=me._right=document.createElement('div');
		els=me._right__img=document.createElement('img');
		els.className='ggskin ggskin_right';
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAG6UlEQVRYha2X229U1xXGf3ufPTfPxVcuLjbGIAMVYCRaUUiAgpQ+pJUacUsThUtf2qriT+Cp732lT0iVitRUJVGrKoBUpFaFqG0ikgcSnGK7EKABYbCxx/bMOWff+nCOZwZwTAJZ0jojzdFZ69vfum5Bi3R0dOzu6e4+UiwWtwshuj1IvgERyU81DMOrDycn/zA5Ofln733zXRAEmYGBgV93d3f/3DmXj6II59w34bshUgiyuRwqCPxMtfqnGzdu/ExrPSUA1g4O/mbZ8uW/nJudpVQus2HDBjo6OggCiUCAEM/p1uM9OOeoVquMjY0xNTlJqVymWq1eHB0d/aEoFosbN27c+Fltfp71GzZw/PgxVq8eoFAooJRCSpnQ1Hx8Lefee4wxhPU69+7d4/'+
			'dvv81HV65QKpX4740bP1YdHR2va60plkocPXKENQNrKLQVKBTaUEGAEOI5nD8OwlpDICW9vb0cOfIW/7tzh8mpSSqVyiFVKBR212s1Nm3aRF//KrK5LOVSiXwhTxAESQheQDweZx0qCHDOsqynh82bN/PeuXP09/cPK2PMSgFUymVy2Sy5bJZsNkNGKYIg+EpOBOCXeO+kw7kM2WyWOI5pb6+gtaZYLHao3pUr5a1btwGPFCLJtyR4OGu/EoCEKbDOJd8+yUJqTwqQMmHUWYvRGtXd0+PHxsdxzuNTp9ZarDU8K+5SCsIw5NKl91m/fojBwUG8dzj3NAib2vXO4b3HOod1DqW1xjmH94lT5wzWaowRSQIuJT5gtlpldHyc62Nj7Nj+XbZt25aw55t9JElEjbMG52yqHuccyjuHswtqscZijcFKiRDymckfxxH5fJ4V'+
			'K1byt79fYmZmhl0vv4SUQdrMPB4Su9ZgjUl8uYQNtUBFojbRlK4g8OC/LMUEPkkYdBwTRRGr+vr494cfMTc3x97v7yGfz2FtAsJag7W2hYE0BN45nE8QOWsbNBmj+fzzL3j4cLLJwhM4hBDMzs1hjKFaraK1prOzk6ufjhCGIXv37KJcqSQHajmYc66hynvfSIwFEN45wnqdz66PEcUG4LGPFgwZkxiWQlKtVjHGoLVGyoBPR64Ta83ul3fS1dWFd83Te+8Sn86hnPc47/FpUiwkhzYapRTaJOCEaCal9z7VxEiUOjbGNEDEcczVT0aw1rFj+3fo6uxMnfrEh09yQzWM4ZpGvUMgiMKQDz68Qm1+nlqtRhiGRFHUcNQ6MaWUSClRSjVUSsn9+/cJw5BdO79HW1shte8bqpq1kmjaM1BKcev2bc787gyZjEIIkQymlI'+
			'mn2fBpOfsGMGstnZ2dAOSyGXa9tIMny0qxhGitKZdL5PPJXGgF0MCddr7WHDHGEGtNpVxm3bp15LKKFcuXIeTT+00TgCCZ+6kKITDG0tXVRaFQWARAszyNMcRx3EhQYwzLi0V6urtYM9DP4YP7WbduLbVaLe0KTwLwKQKRlJYAlMqwedO3GR0dJYpjZAv6VhKTE1vmazWMMXjvCYKATEaxZfMmXj98gNWrV6O1TsHLxxYc1RpTKSRSCBASISU7d2znW70rCaNo0bEspWR2dpa/vHeeh5NTSCmp1WoYo9m7ZzcH9r/GihXLcS5JapHaly0+HwMgUsdCJFSXShW2bNnypTkSBAFTjx5x6f1/ggx4MDGBd5YD+1/jR6++Snt7JS1hCTKxjZSNED/BQFJGQgZpSQUIKZac8z59ZLJZHj54gHOWnx4/yr59+2grFHB+4eQg'+
			'RdKwpAweqyS1sPMJIZrOgwC5sI4tIQJJW1uRUrFIpVLiJ4cPs3PnDjKZDN57pGguNE2bTYaFEKjqzIwIlEqzn0b8F5AuCUBAvlDg0MED1Op11q4dRAUqpb2FKe8RMgDRpL8B4PadOz6XywI0lhJ8WoqL1O1iIPr7Vyfhch6Pfwq4TxtT0qSSRXWhsSkp5QOA+bl5oliTyWhirZFB0NwJn7ETCAC7yNBO/3DOEseaONZorZmbmyObzXL37t2qmp+f/6C9vX3v2NgYExMTBL29SBkk+4BS6cXk2YvnYqC8T9YRay1hGFKr15menuHayAi5bJZHjx6NBKdPn566cOHCL+r1OtPT0wwNDZHLZRs3GmstxprGAPq6qrUhimLCMGJ6epp333mXjz/+mCiOOXny5K+E954333jjnb9evHiwkM+zqq+P4eFhOjs7k233ua9laR'+
			'TSPWNmpsq1a9e4efMmURQxPDz8r/Pnz+8V3nsmJibaT5w48dvLly/v996nFyHRGDQvKqLlZuW9Z+vWrf84derUW0NDQ1+IBSdaa86ePXvo/Llzb46Pjw9b59rFix6/Rbz38319ff/5wSuv/PHosWNnyuWyBvg/6qdRxeUb3H8AAAAASUVORK5CYII=';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._right__img.ggOverSrc=hs;
		el.ggId="right";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 35px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._right.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._right.onmouseover=function (e) {
			me._right__img.src=me._right__img.ggOverSrc;
		}
		me._right.onmouseout=function (e) {
			me._right__img.src=me._right__img.ggNormalSrc;
			me.elementMouseDown['right']=false;
		}
		me._right.onmousedown=function (e) {
			me.elementMouseDown['right']=true;
		}
		me._right.onmouseup=function (e) {
			me.elementMouseDown['right']=false;
		}
		me._right.ontouchend=function (e) {
			me.elementMouseDown['right']=false;
		}
		me._right.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._right);
		el=me._up=document.createElement('div');
		els=me._up__img=document.createElement('img');
		els.className='ggskin ggskin_up';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._up__img.ggOverSrc=hs;
		el.ggId="up";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 70px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._up.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._up.onmouseover=function (e) {
			me._up__img.src=me._up__img.ggOverSrc;
		}
		me._up.onmouseout=function (e) {
			me._up__img.src=me._up__img.ggNormalSrc;
			me.elementMouseDown['up']=false;
		}
		me._up.onmousedown=function (e) {
			me.elementMouseDown['up']=true;
		}
		me._up.onmouseup=function (e) {
			me.elementMouseDown['up']=false;
		}
		me._up.ontouchend=function (e) {
			me.elementMouseDown['up']=false;
		}
		me._up.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._up);
		el=me._down=document.createElement('div');
		els=me._down__img=document.createElement('img');
		els.className='ggskin ggskin_down';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._down__img.ggOverSrc=hs;
		el.ggId="down";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 105px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._down.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._down.onmouseover=function (e) {
			me._down__img.src=me._down__img.ggOverSrc;
		}
		me._down.onmouseout=function (e) {
			me._down__img.src=me._down__img.ggNormalSrc;
			me.elementMouseDown['down']=false;
		}
		me._down.onmousedown=function (e) {
			me.elementMouseDown['down']=true;
		}
		me._down.onmouseup=function (e) {
			me.elementMouseDown['down']=false;
		}
		me._down.ontouchend=function (e) {
			me.elementMouseDown['down']=false;
		}
		me._down.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._down);
		el=me._zoom_in=document.createElement('div');
		els=me._zoom_in__img=document.createElement('img');
		els.className='ggskin ggskin_zoom_in';
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAHJklEQVRYha2X329cRxXHPzNz95f3p71psFPXbpwaGyl1AAFpgSAKiSrxgIQooiFp+gQIhf8gT7zzGh4DUqUWkVbw0rgiom0UoYqqjUSlpJXtOI0aO9Su7fWu17v33vnBw1xf72LngbRHOl7J9875nvs935lzRtBjtVrtxIF6/WyxWPyWEKLuQPIFmPA/zW63+8Fna2t/Xltb+5tzbveZUiozPj7++3q9/itrbT4MQ6y1XwR2alIIsrkcgVJus9n86+Li4i/jOF4XABOHD//hkYMHf7PValEql5mamqJWq6GURCBAiIeEdTgH1lqazSbz8/Osr61RKpdpNptX5+bmfiSKxeLU9PT0R9vtNl+emuLFF88xNjZOoVAgCAKklJ6m3T//F7hzDq013U6H+/'+
			'fv8/Irr/D+e+9RKpW4vbj446BSqZzWcUyxVOKFs2d5fPxxCgMFCoUBAqUQQjwEeH8SxmiUlIyMjHD27BnuffIJa2trVCqV54KR4eETjc1Njh8/zuhjj5LNZSmXSuQLeZRSvgT7mJACJRUIsMZinQW3bwpYYwmUwlrDIwcOcPToUWbfeINisTgTjI2NHfzPu+9SKZfJZbPkslmy2QyZIEAptT+4EHS7XW7fXUBrw9jYY1QqlQcK10qLtRmy2SxRFFGtVuh2u0xMTNSCWGtpjAUcUgivN188rDF7gkkp2e5s848338avg/dv3ODkD55hZGRkXyZcEk8KkNIzao3BOYe01jpjLdY6XAJqjMEYjdZ73VrL3Y/vEnZDnnxyhunpryCl4srsLFEUYo3Zs8akMQ3OWpxzGGsxxhBYa7HW4JwHtVZjTIzWwgtwD/2O7e02xlqa'+
			'zU3iOMZax8LCAu12m4GBwp5SeCHGWKOx1iTusNYSOGu9iIz1X68NRmuMlPsnADhniaKQra0t4jgmDLsYY4ijCJPN7E0AfFyjMVp7LOvZCIy17LrxnpTAJ9CfhBACnENrQ7PVQscxcRyjpPQAxuwjRtfzbMc9pmfA+YysMVizUzPpDyHRvxGds0gpMcbQ3NxEa00URSilcM7CjvcI0DrX82EefMcD51wqjDQJa7BWEXa7NJsttNYp/1JK1tc3MEbTaDTQWhNrjbGWpaVlSqUi1joEIJWiVBogn8v3xDU4Zz2mtQQ2ydAlorDWgbN0Ox0Wbn/M8qeruwk6/9wYQxxrwjD0ynaOwaEDXP/nv7DOYrTfCcYaJg6P842vH6NSriSgzgvQORwkDDiHw4M4Z3EOmq0WN/79AQsLi3S7Hba3t+l0OoRhhNbxnlqLpGcopQiCgC'+
			'AIEEJyb2mZQEqeeuqbPfFd6kGfVP15kdpbb77F29euJcFEqgkpd/WxE2jnjLAJW+C74PT0NGOjh/jaV2eS9/vlGfAAK+QLPP30cVZWP0PKflApJVtbW3Q6HR8kCKhWq31JeIYc9XodgSOTyRDHeg/ObgIC3/eFwDrHQLHAD5/5HkZrlu/f7zsTjLF8urLK8vIyAIODg9SHBqlUykjZP0SVSyW++51vk8lmieJ4z2wRpPTj264QItl6gonDE5z5xUHa7XZaG6UU95aW+NNLL1OpVBHC/294+Euc/vnPKBQKuB1tCBgYKFIqFtHJuSJE/4ATpIBCIIVMGpL0LgXVapVarba7IAjohhG5bI7BwUGEgDiOyWQyHDp0iGKx2H8QpbvHIpL4sgezLwEPKnt+xU6M3ngYa8jlcuTyeQBarVayHdNG2mdCSJA+JlKC2O0zQS+4'+
			'lBIhVSI4tW8v8DUWDBSL5PP5VPGwK9T9TArjGU7ipgz4DJPa74ArhVQPSEApVBBQKhUZGjoAJAeYidN1+w2xuzEThtOyJ1/PzuyX0C+l2tdBMDw8TCFfYGNjnXa7zfz8PENDdXK5/L5rfEkViF360wT85JtMKclQgvNKFUndet0BtWqNZ589RRSFfPjhLZ44MsGpU6fIZLO+GP+zhlRLLsEgPU+C1dXV9UwmQ3urTRjFZDIxUezpTGfCvnbo4x058gS/PX+eVqtJsViiXC6nQkzfT+RhrSGKYqLIt+6trS2y2SzLy8vNYG5u7p16vX5ifn6elZUV1MgIUiqMMaggSC4mySDSq2wEKggYGqrjnKPT6eJ63khHS3zz6na7bHc6NBqb3Lx1i1w2y8bGxi116dKl9dnZ2V93Oh0ajQaTk5Pkctn0RmOMQT9gPoxjTRTHxL'+
			'FG6/iB74RhRLcb0mg0eO3V17hx4wZhFHHhwoXfCeccp59//tW/X73600I+z6Ojo8zMzDA4OOjvBQ99LaOn7obNzSY3b97kzp07hGHIzMzMO1euXPm+cM6xsrJSPX/+/B+vX7/+E+dcchESPXv885nouVk55zh27Ni1ixcvnpmcnFwSOyBxHHP58uXnrrz++umFhYUZY21VfN7P7zHnXHt0dPSjUydP/uWFc+deKpfLMcB/AZEVqATqfxD6AAAAAElFTkSuQmCC';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._zoom_in__img.ggOverSrc=hs;
		el.ggId="zoom in";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 140px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._zoom_in.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._zoom_in.onmouseover=function (e) {
			me._zoom_in__img.src=me._zoom_in__img.ggOverSrc;
		}
		me._zoom_in.onmouseout=function (e) {
			me._zoom_in__img.src=me._zoom_in__img.ggNormalSrc;
			me.elementMouseDown['zoom_in']=false;
		}
		me._zoom_in.onmousedown=function (e) {
			me.elementMouseDown['zoom_in']=true;
		}
		me._zoom_in.onmouseup=function (e) {
			me.elementMouseDown['zoom_in']=false;
		}
		me._zoom_in.ontouchend=function (e) {
			me.elementMouseDown['zoom_in']=false;
		}
		me._zoom_in.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._zoom_in);
		el=me._zoom_out=document.createElement('div');
		els=me._zoom_out__img=document.createElement('img');
		els.className='ggskin ggskin_zoom_out';
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFgklEQVRYha2XzW9U5xXGf++H58PzZceGyMaxA8Q1FchsqqhSRdJFuqmiSFGzAGHIpm1S8Sc0m+67JTuURaWmKonaDUYqq4CqSPkgUiVQhMEoUIIy6TjD4PF8vPd9TxfvnZmLIAvMHOn4juSZ8zz3Oc8977mKTExNTR2bnZlZK5VKLyulZgQ0YwgVL61ut/uf/zUaf2s0Gv8UkdH/jDETS0tLf56Zmfl9CKHQ6/UIIYwDexhaKXL5PNYYedBq/WNzc/N3zrktBXBg//739+zd+4fthw8pVyqsrKwwNTWFMRqFAqV2CSuIQAiBVqvFxsYGW40G5UqFVqt16caNG79WpVJp5dChQ1/vtNv8ZGWFt98+zeLiEsViEWstWuso0+jPU4GLCEmS0O10uH//Pn'+
			'/98EO+/OILyuUytzY337C1Wu2Ec45SucyptTVeXHqR4mSRYnESawxKqV2AP0rC+wSjNXNzc6ytneS/d+/S2NqiUqm8ZWvV6rGddpvDhw+z8MI+cvkclXKZQrGAMSa24BlCEIIPWGMIwbNndpYjR45w4cI68/Pzq/bgwYN7r371FdVKhXwuRz6XI5ebYMJajDHPBD6IoAMhTJDL5ej3+9RqVfquT61Wm7IopX3iAUErFf0Wm0fwfiwEJK2nFWgdFQ3ekziH9d6LD4EQBElBvfd4n7C7vj85fFpXQkBE8CHgQ8CGEAjBIxJBQ0jw3pEkKhpwDBGN6Ag+IQSfphBCwEoIBD9Ij088PknwWo+PAMS6PsEnScQKUQ07kCKmj5m2IBIYBwmJ4N5nFEhbICEQJDIK3hPSL3qv0TrmrpUQiVJLyNxYBB+kFZGhMYYkgkeCodvv'+
			'8d13dVzfPTaMHp9NmYmRfjDGsGd2lkKhMKwb/RYiZgjYIEIQQVJThCAggW63yydX/s29+3WM1pGgjJgHHyWMpOMdDq4+8SRJgksciy/s4803XqdaraagA1UEgVQBEYSogkg8Bbd++IGNW7dpNLbodDrs7OzQ6XTo9Xo4l6RPTPwNgFIabTTWGKy18RwxhtbDbfbNz/PqK78Y1h9iimAzPoE4L6KGApcvX+azzz4nn8+jVHwss55QSg0LDZQZfIZ4Ci4uLvLS/iV+/vLP0u8/ahPLE0JEqFTK/PTQCt/cuTscywMSWVNm7yZrroHZRARroyrOJY9hjQgo4rmvFEGEyclJTp08TrlU4t6336KUTmX6sVBZ/6WiCs8/v5dXXznGRC5H37nHdgs7lJ947Gbv8MCBA7z7zm9pt3eGvX6aUAqKxSKlyUkS70e1MyRsVlatdH'+
			'og6TQVlUqVarX21ODDGD49Eo2qVIoR8xECSmmU1pmrGtR4plBKg4410RoyKtssuNYapU06Ac3YzgIArXxUWD9qZhsZpr0fgBuDNmMmMKw5aq9SCjvoOYPdL5V/nAqICEobUCP5Rx7QerSlpEsJEp2q9FjeS5B0MEl6OIlExa212M1bt7YK+Tzt7Ta9vmNiwtF3Dm3MaCfc/WsBACF4+n1Hv+9wzrG9vY21lmaz2bL177//9Lnp6WMbGxvU63XM3BxaG7z3GGvTF5PI4WkehuFqieC9p9vtstPp0Gw+4Nr16xSLRe7euXPdnDt3buvixYvvdDodms0my8vL5PO54RuN957EJyTJ7tK5hF6vT7fbo9ls8vFHH3P16lV6vR5/fO+9PykR4cTx4x/969Kl3xQLBfYtLLC6usr09PRw/j9LDPaMBw9aXLt2jdu3b9Pr9Vhd'+
			'Xf10fX39l0pEqNfrtTNnznxw5cqVN0UkXTbUrsbvk0JlthcR4ejRo5+cPXv25PLy8j01AHHOcf78+bfWL1w4cfPmzVUfQk2NcRCISHthYeHrX7322t9PnT79l0ql4gD+DzIAl12Z9ddPAAAAAElFTkSuQmCC';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFb0lEQVRYha2XzW9U5xXGf+/HHY8NxrgxkRDjVOAaiBqNdw2gUKGILkClKGoTKbQBZdFKBXXJX4DYdVl3h7KI1JAStxUSSURXjqVGhLSxKgGRhsRsItQJBGxhz51773tOF/fDY9JWtT1HOr4z8ug8z/ucj/dco6qUNjs7e/j9a9d+cefOnR9kITxjjLH0yVR1aXx8/J/Hjx+/fOLEib9Ym4c2qsrK8nJ04cKF337w4Ye/SpOkLqqoKvSQ26wZa7HW4pzTAwcO/PnixYu/3LFjxzdGVTl//vzv/zQz8+t6vc62kRH27t3L9u3bcc5iMGDMRs+NKogIS0tLtFotHj58SJokHDh48K+XLl06bubn5/e99uqrn1tr2bd/P2fOnOa5577L4OAg3nustRig58'+
			'+6wFWVLMuIOx3u37/PH955h79/+ilJkvC76emfuPFG4zef3Lx55Dujo5w9e5bdu3cztGWIoaEt1AcGqEURUS0iimpEUbRO90RRhPcOaywDAwNMTOxhfn6eR48e45xL/T8+++ywiPC9yUka47uoDdQY3rqV+mAd51yegk2YokgQvHOIBHaMjfHC91/gyy8XaLVaTd/tdp8NIbBteJiBWo2BWo1aLSLyHufcpsBLEyuIRNRqNZIkYWRkGyEEsizb7lXVhiwAijUmr7eiAySEvhAoO8oasDZXVEJARfAiokEEkbz1JARCCISQsb6i+98WirgqgqoSRAgFAUQCqjmoSEYIKVlmMBtuv7WmCiGkSMgQCYUrIoJXESSUHghZIGQZwdr+EYA8bsgIWZZjSZGCUorcQ+5FCnIC/SChOXgIPQoUKVARRHNGEgJS/DCEfHRWg2iD'+
			'J8/ja8/BcvDSvapWhVGRkICII0kS2u2vSdO0Zxqv0lk7HM1T/wXnHWNjY9RqtZ64AVXJMUXwooqookVR5N0gJN2Y2bm/8dX9f+GsywmqFMUTkJBLKGFVTglFCrNAlmUkacq+yQleOfljoihCRAqcAhMKBVRRchVUBQM8erxI64sFHjx4SKfTYXllhbjTodvtkqZpJWV5nRtjsNbiva/cGEMcxxw6+CKNXTtBJT99iamKX5uwagbhnOOjj+a4ceMGURRhjMEYi7Wm+JyL3RuszGvv94mJCUTfBEwVu9c8/8FUlW3DW/nhS4dot9vlPV4B97ZnroBWfa1lR4VAmqYcOvgiz449gz6N/C0ChvzeNwZFcS7izTNvcPTlI8RJsqFO8N7TaOxiy9AQSZpU8b9NQAsGJs8lxoIxDA4O8vzz+wt269yOCqCyVoyxq+r1kPC9sl'+
			'pjsdUz39mCyAbO3mNKFc9U8Vcx1xAwxmKs7Xn2YQqWIWweE5urW8b2veDWWox1xQR0fbsLAKwJuRJ2bTF7KGvDrII7h3V9JlDFtGvqwZenz1kAhfz9VEBVMdZVxW2eroFqS5HyfSCvVGP7816iRSHnwynflstC9M7ab6y1LD9ZppukRFFKkqZY51Z3ws1ch4BIIElSkiQlTVOePHlSdJ1Z8s2pqY8/uXnzcKvVot1u43buxFpHCAHnffFisv5JUK2WKCEE4jhmpdPh8eNFbt2+Dcawe8+e2/bkyZPveu/5+sEDLl9+N7984g4rKx06nQ5xHBPHMZ3i+f96+ftOJy5ixSwuLjIzM8O9e/cAOHbs2IwREU6dOvXe9evXfzpYr7Or0aDZbDI6OlrN/81YuWcsLi5x69YtFhYW6Ha7NJvNj69evXrEqCrtdnvk3Llzb83N'+
			'zb2iqsWiYf7rBbJeMz2bi6oyNTU1Oz09/fPJycmvTAmSpilXrlz52fvXrr1+9+7dZhAZMX0cBKq63Gg0Pv/R0aN/fOP06beHh4dTgH8Dd9OZoDqOZJsAAAAASUVORK5CYII=';
		me._zoom_out__img.ggOverSrc=hs;
		el.ggId="zoom out";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 175px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._zoom_out.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._zoom_out.onmouseover=function (e) {
			me._zoom_out__img.src=me._zoom_out__img.ggOverSrc;
		}
		me._zoom_out.onmouseout=function (e) {
			me._zoom_out__img.src=me._zoom_out__img.ggNormalSrc;
			me.elementMouseDown['zoom_out']=false;
		}
		me._zoom_out.onmousedown=function (e) {
			me.elementMouseDown['zoom_out']=true;
		}
		me._zoom_out.onmouseup=function (e) {
			me.elementMouseDown['zoom_out']=false;
		}
		me._zoom_out.ontouchend=function (e) {
			me.elementMouseDown['zoom_out']=false;
		}
		me._zoom_out.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._zoom_out);
		el=me._auto_rotate=document.createElement('div');
		els=me._auto_rotate__img=document.createElement('img');
		els.className='ggskin ggskin_auto_rotate';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,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';
		me._auto_rotate__img.ggOverSrc=hs;
		el.ggId="auto rotate";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 210px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._auto_rotate.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._auto_rotate.onclick=function (e) {
			player.toggleAutorotate();
		}
		me._auto_rotate.onmouseover=function (e) {
			me._auto_rotate__img.src=me._auto_rotate__img.ggOverSrc;
		}
		me._auto_rotate.onmouseout=function (e) {
			me._auto_rotate__img.src=me._auto_rotate__img.ggNormalSrc;
		}
		me._auto_rotate.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._auto_rotate);
		el=me._fullscreen=document.createElement('div');
		els=me._fullscreen__img=document.createElement('img');
		els.className='ggskin ggskin_fullscreen';
		hs='data:image/png;base64,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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_button';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		hs='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAHtElEQVRYha2X649U5R3HP8/znHNmdmdvM4BGmEV32VlttIvWitCU1ib0hSTWNK1NpF6SprZe2r7zLzC+68vSd6Zp2lQtgo0JYpG0oiAKWLYkLGwWWC7CwnaX3dnbuT2XvjhnhlkSSZX+kt+cnDkn39/3+d2PcM7RkP37929+d/fup06ePLlBG7NCCCH5P4lzbq63t/f41q1b33jsscf+JmUGLZxzLC0u+q+88spv97z33i/SJCla53DOQQu5WxUhJVJKlFJu48aNb7/66qvPrVq16ppwzvHyyy//ftfOnS8Ui0W6ursZHBykp6cHpSQCAUJ81XPjHFhrmZubY2xsjOnpadIkYeOmTe+/9tprW8Xw8PDdP3niiVNSSu6+5x6effYZ1q69k7a2NjzPQ0'+
			'qJAFp+vpRx5xxaa6IwZGJigr+8/jqfHT1KkiT8bvv2H6jeavXXh48ceaRSLvPiiy/S19dHe6md9vYSxUKBwPfxAx/fD/B9/0uqh+/7eJ5CCkmhUGDdun6Gh4eZmZlFKZV6/zp2bLO1loFajWrvGoJCQGdHB8W2IkqpLAS3IA6HNRZPKaw1rFq5kvvuvY+zZ8cZGxv7uhfH8W3GGLo6OykEAYUgIAh8fM/LCOTx/7I0GunrnMNKi7U+QRCQJAnd3V0YY9Ba93jOOWm0ARxSiCzf8gpwzqK1IY5iHA5u9EeeF6LlvnknwPOygzhrwTmkACmz59YYnLXSs9Y6Yy3WZqVnjcEYg7WGen2WTw8fxVqLy0vTWJu9Yy3OWqxzy543/zMGgE0bH2ZgYB3WZrguf9dYi7HWedZarDU4ZzBGY63GGI1zPqdGR3EIpFKAoFAoEAQB'+
			'xWIRKSVaa5IkJU0TwjCkXq+zEC4QRRFRFJGmKYc++ZS1a6sZttFYa3LNiEtnLdY01GB0RsRoQxzHxHHM5NUrrKp0o4Tl2tQkH/zzH0xMTBDHMVEUEkURx4//myRaov+uXjY9/E3u/dogYRiSJglpEmNMA1dntmzmDS93Ra4GYw3WaIxJcbnbOjo6GBwcoFAocOXKVS5dnkApj3q9TpqmWGsptrVTra5m87e/BQiOHD2KMRbrbOZ6RzO0mWY2vSxmGSNrGsYNWmuEEFmsjWZxcQGAzo4StYE+zl24QKnUQao14dISle5OagPrCMMQJSXzc/Noo5FS5gRc7oXMeENlI3Gccy0kMnd5SpEm2QlHTo4yPn4OYwwrV1RI4oTZ2Vnm6nXm5+cpl3soBAHTU9McGz7OzOwsOk3xPS+P//XTO5clsLMWzzqHdQ6XJ0UjOawxKM'+
			'9D6wzkwsUJrlydZn5hgc8vTaCNQcdx01tjZ85Ram9ncmqaEyOn6OrqJI4TfN/HGYsjmwmZndwm4DXLh0YpWZzL3OMpxejoKJcvX84zO8Y5y9LSElprrLUtPUGwb9++Zjn6vo/n+0gpc3wHOXbTpnN4y1qXa/YgBAJjLHv27OHMmTPNwdTX18fk5CRxFCGVagKlaUq1WmVmZpaZmWsIIVBKseV730Uqhda6id0qHl8kQqB1ilKKDRseYuWKlWiteeGXP+fAx4fY8dYuGstMmqb09/fzm189z8jIKG/tepvBWo29779PFEU3bdnXCYjMaEOFECRpRmDNmjU8+9STlEol7rpzLb3V1czNzfPhgYPgHOVymeef+xkPPnA/d9dqPPiN+zlzdpwDBz8mTuJluDfuFl7T/VkjR+TGpZToVBME2XQcHKzRUSqhtWbiylXqc3P0'+
			'9PRkmez5nL9wkQceWE+53MOq21ZSr9cplUokSdrEbGgrCdn6QAqJbFylwlhLoVikUilnC4rvY6xlz9/3MT09Q6VcplKpUCwW+ODDA4yOjlEstqGUT7lcprOzA2tsjisRTfzrNr3l7CRCXleAjlIHbW1tnD9/kbn5ea5dmyHwfSqVMn4QNIeXlILzFy5i3UEqlTJRHNPT07MMT0gJUjZDDLQSyJZGIRVCKqRUBEGBrq4uPr80wR///HqWdEJQCAJuu/12yCehMRatUw5/doyDnxwG55phbGsrojwPY13Ts62H9mjmnsgNZ0QcUKsNsOGhB5mankYpL1tSW9jjso3HWYd1lhW2nJExmjRNWb36Dr6zeTNKeQhhkEplXhbyxhDInAUgGu4XVCorePqpbYRhlDeSm9RT63KS/wS+RxAUsNYipABx3f3LCDS3FNv4HrheMp'+
			'4f0BUUblrLXyh5m8+yXuTzJtuWG4noKSmvSSlZXFgkTlJ8PyVJU6RSKKVaTvdVCJAfzJAkab68pCwsLORVJ+re0Pr1hw4fObJ5bGyMyclJ1B13ZCWYDyPR6A/cPAI3SnO1JBvDURSxFIbMztY5MTICQtDX3z8iH3/88Tc9z+M/U1O88cabTE1NE0YhS0shYRg216swv/6v2ng/DKMcK6Jer7Nz507OnTsHwKOPPrpLWGvZtm3bW3v37v1RW7HImmqVoaEhyuXysrX8q0pjz6jX5zhx4gTj4+PEcczQ0NChd9555xHhnGNycrL7pZde+sNHH330Q+dcnsSiOWxuVUTLZ51zjvXr1+/fvn37T2u12iXROtF27Njx43d3737y9OnTQ8babnGrx28R59xitVo99f0tW/769DPP/KmzszMF+C/rh/sPVENWrwAAAABJRU5E'+
			'rkJggg==';
		me._fullscreen__img.ggOverSrc=hs;
		el.ggId="fullscreen";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_button ";
		el.ggType='button';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 245px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._fullscreen.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._fullscreen.onclick=function (e) {
			player.toggleFullscreen();
		}
		me._fullscreen.onmouseover=function (e) {
			me._fullscreen__img.src=me._fullscreen__img.ggOverSrc;
		}
		me._fullscreen.onmouseout=function (e) {
			me._fullscreen__img.src=me._fullscreen__img.ggNormalSrc;
		}
		me._fullscreen.ggUpdatePosition=function (useTransition) {
		}
		me._toolbar.appendChild(me._fullscreen);
		me.divSkin.appendChild(me._toolbar);
		el=me._image_1=document.createElement('div');
		els=me._image_1__img=document.createElement('img');
		els.className='ggskin ggskin_image_1';
		hs='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QHSaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjYuMCI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMT'+
			'ktMDItMTJUMjM6NDU6NTArMDI6MDAiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTAyLTEyVDIzOjQ1OjUwKzAyOjAwIgogICB4bXA6Q3JlYXRvclRvb2w9IlBhbm8yVlIgNi4wLjIiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz7/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCABkAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcI'+
			'CQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiI'+
			'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';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="Image 1";
		el.ggDx=154;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 50px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 14px;';
		hs+='visibility : inherit;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._image_1.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._image_1.onclick=function (e) {
			player.openNext("{node4}","");
		}
		me._image_1.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me.divSkin.appendChild(me._image_1);
		el=me._image_2=document.createElement('div');
		els=me._image_2__img=document.createElement('img');
		els.className='ggskin ggskin_image_2';
		hs=basePath + 'images/image_2.png';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="Image 2";
		el.ggDx=-155;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 50px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 13px;';
		hs+='visibility : inherit;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._image_2.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._image_2.onclick=function (e) {
			player.openNext("{node1}","");
		}
		me._image_2.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me.divSkin.appendChild(me._image_2);
		el=me._image_3=document.createElement('div');
		els=me._image_3__img=document.createElement('img');
		els.className='ggskin ggskin_image_3';
		hs=basePath + 'images/image_3.png';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="Image 3";
		el.ggDx=-52;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 50px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 14px;';
		hs+='visibility : inherit;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._image_3.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._image_3.onclick=function (e) {
			player.openNext("{node2}","");
		}
		me._image_3.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me.divSkin.appendChild(me._image_3);
		el=me._image_4=document.createElement('div');
		els=me._image_4__img=document.createElement('img');
		els.className='ggskin ggskin_image_4';
		hs=basePath + 'images/image_4.png';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="Image 4";
		el.ggDx=50;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 50px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 14px;';
		hs+='visibility : inherit;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._image_4.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._image_4.onclick=function (e) {
			player.openNext("{node3}","");
		}
		me._image_4.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me.divSkin.appendChild(me._image_4);
		player.addListener('sizechanged', function() {
			me.updateSize(me.divSkin);
		});
		player.addListener('imagesready', function() {
			me._loading_image.style[domTransition]='none';
			me._loading_image.style.visibility='hidden';
			me._loading_image.ggVisible=false;
		});
	};
	this.hotspotProxyClick=function(id, url) {
	}
	this.hotspotProxyDoubleClick=function(id, url) {
	}
	me.hotspotProxyOver=function(id, url) {
	}
	me.hotspotProxyOut=function(id, url) {
	}
	player.addListener('changenodeid', function() {
		me.ggUserdata=player.userdata;
	});
	me.skinTimerEvent=function() {
		me.ggCurrentTime=new Date().getTime();
		me._loading_text.ggUpdateText();
		var hs='';
		if (me._loading_bar.ggParameter) {
			hs+=parameterToTransform(me._loading_bar.ggParameter) + ' ';
		}
		hs+='scale(' + (1 * player.getPercentLoaded() + 0) + ',1.0) ';
		me._loading_bar.style[domTransform]=hs;
		if (me.elementMouseDown['left']) {
			player.changePanLog(1,true);
		}
		if (me.elementMouseDown['right']) {
			player.changePanLog(-1,true);
		}
		if (me.elementMouseDown['up']) {
			player.changeTiltLog(1,true);
		}
		if (me.elementMouseDown['down']) {
			player.changeTiltLog(-1,true);
		}
		if (me.elementMouseDown['zoom_in']) {
			player.changeFovLog(-1,true);
		}
		if (me.elementMouseDown['zoom_out']) {
			player.changeFovLog(1,true);
		}
	};
	player.addListener('timer', me.skinTimerEvent);
	me.addSkin();
	me.skinTimerEvent();
};