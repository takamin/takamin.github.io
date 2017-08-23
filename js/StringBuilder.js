/***
 * class StringBuilder
 * @returns
 */
function StringBuilder() {
	this.buffer = [];
	this.buffer.push(Array.prototype.slice.call(arguments));
}
StringBuilder.prototype.append = function() {
	this.buffer.push(Array.prototype.slice.call(arguments));
	return this;
};
StringBuilder.prototype.push = function() {
	this.buffer.push(Array.prototype.slice.call(arguments));
	return this;
};
StringBuilder.prototype.toString = function(s) {
	return this.buffer.join('');
};
