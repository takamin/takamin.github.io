var ie8 = false;
var userAgent = window.navigator.userAgent.toLowerCase();
var appVersion = window.navigator.appVersion.toLowerCase();
if (userAgent.indexOf("msie") != -1) {
	if (appVersion.indexOf("msie 8.") != -1 || appVersion.indexOf("msie 7.") != -1) {
		ie8 = true;
	}
}
if(!ie8) {
	if(Element) {
		Element.prototype.getComputedStyle = function() {
			var style = this.currentStyle || document.defaultView.getComputedStyle(this, '');
			return style;
		}
		Element.prototype.getEffectiveWidth = function() {
			return this.getComputedStyle().width;
		}
		Element.prototype.getEffectiveHeight = function() {
			return this.getComputedStyle().height;
		}
	}
	if(SVGSVGElement == null) {
		SVGSVGElement.prototype.getComputedStyleOriginal = SVGElement.prototype.getComputedStyle;
		SVGSVGElement.prototype.getComputedStyle = function() {
			return this.getComputedStyleOriginal(this);
		}
		SVGSVGElement.prototype.getEffectiveWidth = function() {
			return this.getComputedStyle().width;
		}
		SVGSVGElement.prototype.getEffectiveHeight = function() {
			return this.getComputedStyle().height;
		}
	}
}
