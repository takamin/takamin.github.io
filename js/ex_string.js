/**
 * String.right(n)
 * Stringクラスの拡張
 */
String.prototype.right = function(n) {
	return this.substring(this.length - n);
}

String.prototype.left = function(n) {
	return this.substring(0, n);
}
