/**
 * 複数の連続したカラーマップ
 * @param colorMapArray
 * @returns
 */
function ColorMaps() {
	this.colorMapArray = [];
}

ColorMaps.prototype.setMap = function (arrayOfValueAndColor) {
	this.colorMapArray = [];
	var n = arrayOfValueAndColor.length;
	for(var i = 1; i < n; i++) {
		var j = i - 1;
		var minValue = arrayOfValueAndColor[j][0];
		var maxValue = arrayOfValueAndColor[i][0];
		var minColor = arrayOfValueAndColor[j][1];
		var maxColor = arrayOfValueAndColor[i][1];
		this.colorMapArray.push(
				new ColorMap(
						minValue, maxValue, 
						minColor, maxColor));
	}
}
/**
 * 値に対応する色を返す。
 */
ColorMaps.prototype.getCssColor = function (value) {
	var colmap = ColorMap.getEntry(value, this.colorMapArray);
	if(colmap == undefined) {
		return "#000";
	}
	var ratio = colmap.getRatio(value);
	var color = colmap.getCssColor(ratio);
	return color;
}

ColorMaps.prototype.adjustMaxElevation = function(newMax) {
	var currMax = 0;
	for(var i = 0; i < this.colorMapArray.length; i++) {
		if(this.colorMapArray[i].range.max > currMax) {
			currMax = this.colorMapArray[i].range.max;
		}
	}
	var m = newMax / currMax;
	console.info("adjustMaxElevation currMax" + currMax + ", m=" + m);
	var prevMin = -1;
	for(var i = 0; i < this.colorMapArray.length; i++) {
		var thisMin = this.colorMapArray[i].range.min;
		if(i > 0 && prevMin >= 0) {
			this.colorMapArray[i].range.min *= m;
			console.info("[" + i + "] min=" + this.colorMapArray[i].range.min);
		}
		if(thisMin >= 0) {
			this.colorMapArray[i].range.max *= m;
			console.info("[" + i + "] max=" + this.colorMapArray[i].range.max);
		}
		prevMin = thisMin;
	}
}
