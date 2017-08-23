/*
 * name:
 * 	class PopupWindow
 * description:
 * 	任意のDIV要素をポップアップウィンドウにタイトル付で表示します。
 * author:	K.Takami BeNest
 * created:	2011-08-03
 */



//function PopupWindow() {}
function PopupWindow(keepAlive) {
	if(keepAlive) {
		this.keepAlive = true;
	} else {
		this.keepAlive = false;
	}
}
PopupWindow.prototype.create = function(element)
{
	this.wrapper = document.createElement('div');
	this.wrapper.style.position = "absolute";
	this.wrapper.style.left = "0px";
	this.wrapper.style.top = "0px";
	this.wrapper.className = "PopupWindowWrapper";

	this.wndBase = element;
	if(this.wndBase.parentNode != undefined) {
		this.wndBase.parentNode.removeChild(this.wndBase);
	}
	this.wndBase.className = "PopupWindow PopupWindowClient";
	
	this.wndBase.style.visibility = "hidden";
	this.wndBase.style.position = "absolute";
	var width  = parseInt(this.wndBase.style.width);
	var height = parseInt(this.wndBase.style.height);
	if(isNaN(width)) {
		throw "PopupWindow::create:" + element.innerHTML + "の style.width がNaN。ピクセル単位で明示してください";
	}
	if(isNaN(height)) {
		throw "PopupWindow::create:" + element.innerHTML + "の style.height がNaN。ピクセル単位で明示してください";
	}
	this.width = width;
	this.height = height;
	
	////$$ 2012-01-13>>> 
	if(this.keepAlive) {
		document.body.appendChild(this.wrapper);
		document.body.appendChild(this.wndBase);
	}
	return this;
	////$$ 2012-01-13<<< 
}

PopupWindow.prototype.show = function(x,y) {
	var left = x;
	var top = y;
	var clientWidth = document.body.clientWidth;
	var clientHeight = document.body.clientHeight;
	if(x == undefined || y == undefined) {
		left = (clientWidth  - this.width ) / 2 + document.body.scrollLeft;
		top  = (clientHeight - this.height) / 2 + document.body.scrollTop;
	}
	this.wrapper.style.width =  "" + ((clientWidth + document.body.scrollLeft) * 1) + "px";
	this.wrapper.style.height = "" + ((clientHeight + document.body.scrollTop) * 1) + "px";
	this.wndBase.style.left = "" + left + "px";
	this.wndBase.style.top = "" + top + "px";
	this.wndBase.style.visibility = "visible";
	////$$ 2012-01-13>>> 
//	document.body.appendChild(this.wrapper);
//	document.body.appendChild(this.wndBase);
	if(this.keepAlive) {
		this.wrapper.style.visibility = "visible";
	} else {
		document.body.appendChild(this.wrapper);
		document.body.appendChild(this.wndBase);
	}
	////$$ 2012-01-13<<<
	
	var onOpen = this.wndBase.getAttribute("onOpen");
	if(onOpen) {
		try {
			eval(onOpen);
		} catch (ee) {
			alert("EXCEPTION: " + onOpen);
		}
	}
}
PopupWindow.prototype.hideByBackgroundClick = function() {
	var THIS = this;
	this.wrapper.onclick = function() {
		THIS.hide();
	}
}
PopupWindow.prototype.hide = function() {
	var onClose = this.wndBase.getAttribute("onClose");
	if(onClose) {
		eval(onClose);
	}
	this.wndBase.style.visibility = "hidden";
	////$$ 2012-01-13>>> 
//	this.wndBase.parentNode.removeChild(this.wndBase);
//	this.wrapper.parentNode.removeChild(this.wrapper);
	if(this.keepAlive) {
		this.wrapper.style.visibility = "hidden";
	} else {
		this.wndBase.parentNode.removeChild(this.wndBase);
		this.wrapper.parentNode.removeChild(this.wrapper);
	}
	////$$ 2012-01-13<<<
}

PopupWindow.prototype.createTitlebar = function(title, height) {
	var base = document.createElement('div');
	////$$ 2012-01-13>>>
	if(this.keepAlive) {
		document.body.insertBefore(base, this.wndBase);
	}
	////$$ 2012-01-13<<<
	
	var titlebar = document.createElement('div');
	var face = this.wndBase;
	
	base.style.position = "absolute";
	base.style.visibility= "hidden";
	base.style.width = "" + this.width + "px";
	base.style.height = "" + (this.height + height) + "px";
	base.className = "PopupWindow";
	
	titlebar.style.height = "" + height + "px";
	titlebar.className = "PopupWindowTitlebar";
	titlebar.innerHTML = title;
	
	face.style.position = "static";
	////$$ 2012-01-13>>>
	//face.style.visibility = "visible";
	if(this.keepAlive) {
		if(face.style.removeProperty) {face.style.removeProperty('visibility');}
		if(face.style.removeAttribute) {face.style.removeAttribute('visibility');}
	} else {
		face.style.visibility = "visible";
	}
	////$$ 2012-01-13<<<
	face.className = "PopupWindowClient";

	base.appendChild(titlebar);
	base.appendChild(face);
	
	this.height += height;
	this.wndBase = base;
}

PopupWindow.prototype.createShadow = function(h,v) {
	var base = document.createElement('div');
	////$$ 2012-01-13>>>
	if(this.keepAlive) {
		document.body.insertBefore(base, this.wndBase);
	}
	////$$ 2012-01-13<<<
	var shadow = document.createElement('div');
	var face = this.wndBase;
	
	base.style.position = "absolute";
	base.style.visibility = "hidden";
	base.style.width = "" + (this.width + h) + "px";
	base.style.height = "" + (this.height + v) + "px";
	base.style.backgroundColor = "transparent";
	
	var onOpen = face.getAttribute("onOpen");
	if(onOpen)  {base.setAttribute("onOpen",  onOpen); }
	var onClose = face.getAttribute("onClose");
	if(onClose) {base.setAttribute("onClose",  onClose); }
	
	shadow.style.position = "absolute";
	shadow.style.left = "" + h + "px";
	shadow.style.top = "" + v + "px";
	shadow.style.width = "" + this.width + "px";
	shadow.style.height = "" + this.height + "px";
	shadow.className = "PopupWindowShadow";
	
	face.style.left = "0px";
	face.style.top = "0px";
	////$$ 2012-01-13>>>
	//face.style.visibility= "visible";
	if(this.keepAlive) {
		if(face.style.removeProperty) {face.style.removeProperty('visibility');}
		if(face.style.removeAttribute) {face.style.removeAttribute('visibility');}
	} else {
		face.style.visibility= "visible";
	}
	////$$ 2012-01-13<<<

	base.appendChild(shadow);
	base.appendChild(face);
	
	this.width += h;
	this.height += v;
	this.wndBase = base;
}
