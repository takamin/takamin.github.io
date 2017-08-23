Element.prototype.getComputedStyle = function() {
//	if(this.currentStyle) {
//		console.info("exists Element.prototype.currentStyle");
//	} else {
//		console.info("NOT exists Element.prototype.currentStyle");
//	}
	var style = this.currentStyle || document.defaultView.getComputedStyle(this, '');
	return style;
}


function PixNum(d){
	var s = (d + "").replace(/[a-zA-Z]/g,"");
	var n = parseFloat(s);
	return n;
}

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

function getElementPosition( e ){
	var p  = {x:0,y:0};
    if( !e.offsetParent ){
        return p ;
    }else{
    }
	p.x = e.offsetLeft;
	p.y = e.offsetTop;
	if(e.offsetParent){
		var pp = getElementPosition(e.offsetParent);
		p.x += PixNum( pp.x );
		p.y += PixNum(pp.y );
	}
	return p;
}
Element.prototype.getPosition = function() {
	return getElementPosition(this);
}
Element.prototype.addClassName = function(newClassName) {
	if(this.className == undefined || this.className == "") {
		this.className = newClassName;
	} else {
		var a = this.className.split(" ");
		var notExist = true;
		for(var i = 0; i < a.length; i++) {
			if(a[i] == newClassName) {
				notExist = false;
			}
		}
		if(notExist) {
			a.push(newClassName);
		}
		this.className = a.join(" "); 
	}
}

Element.prototype.removeClassName = function(className) {
	if(this.className == undefined || this.className == "") {
		return;
	}
	var a = this.className.split(" ");
	var b = [];
	for(var i = 0; i < a.length; i++) {
		if(a[i] != className) {
			b.push(a[i]);
		}
	}
	this.className = b.join(" "); 
}






function stripTags(str) {
	return str.replace(new RegExp(/<.*?>/g), "").replace(new RegExp(/^\s*/g), "").replace(new RegExp(/\s*$/g), "");
}
