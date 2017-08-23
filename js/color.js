/**
 * RGBによる色クラス
 * @returns
 */
function Color() {
	this.r = 0;
	this.g = 0;
	this.b = 0;
}

/**
 * 中間色を得る
 */
Color.getIntermedieteColor = function(ratio, cmin, cmax) {
	return Color.fromRGB(
		cmin.r + Math.floor(ratio * (cmax.r - cmin.r)),
		cmin.g + Math.floor(ratio * (cmax.g - cmin.g)),
		cmin.b + Math.floor(ratio * (cmax.b - cmin.b))
	);
}

/**
 * RGB要素によって色を生成
 */
Color.fromRGB = function(r,g,b) {
	var color = new Color();
	color.r = r;
	color.g = g;
	color.b = b;
	return color;
}

/**
 * CSSの色コードで色を生成
 */
Color.fromCssColor = function(cssColor) {
	return Color.fromRGB(
			parseInt(cssColor.substring(1,3),16),
			parseInt(cssColor.substring(3,5),16),
			parseInt(cssColor.substring(5,7),16));
}

/**
 * CSSの色コードを得る
 */
Color.prototype.getCssColor = function() {
	return "#" +
		("00" + this.r.toString(16)).right(2) + 
		("00" + this.g.toString(16)).right(2) +
		("00" + this.b.toString(16)).right(2);
}
