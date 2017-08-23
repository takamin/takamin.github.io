/**
 * カラーマップクラス
 * @param min	下限値
 * @param max	上限値
 * @param colorMin	色範囲下限値
 * @param colorMax	色範囲上限値
 */
function ColorMap( min, max, colorMin, colorMax) {
	//値範囲
	this.range ={ min: min, max: max };
	
	//色範囲
	this.color = {
			min: Color.fromCssColor(colorMin),
			max: Color.fromCssColor(colorMax) };
}

/**
 * 範囲内位置を取得(0:下限、1:上限)
 */
ColorMap.prototype.getRatio = function(value) {
	var e = this.range;
	return (value - e.min) / (e.max - e.min);
}

/**
 * スタイルシート用の色コードを返す。
 */
ColorMap.prototype.getCssColor = function(ratio) {
	var color = Color.getIntermedieteColor(
			ratio,
			this.color.min,
			this.color.max);
	return color.getCssColor();
}

/**
 * 配列から検索する
 */
ColorMap.getEntry = function(value, colorMapArray) {
	var matchEntry = undefined;
	$.each(colorMapArray, function(i, entry) {
		if(value <= entry.range.max) {
			matchEntry = entry;
			return false;
		}
	});
	return matchEntry;
} 
