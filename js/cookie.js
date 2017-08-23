function COOKIE() {
	this.cookie = {};
	var THIS = this;
	var cookies = document.cookie.split(/;\s*/);
	$.each(cookies, function(i, entry) {
		var kv = entry.split('=');
		THIS.cookie[kv[0]] = decodeURI(kv[1]); 
	});
}

COOKIE.prototype.each = function(f) {
	$.each(this.cookie, f);
}
COOKIE.prototype.exists = function(key) {
	return key in this.cookie;
}
COOKIE.prototype.get = function(key) {
	return this.cookie[key];
}
COOKIE.prototype.set = function(key, value, expires) {
	expires = expires || 0;
	this.cookie[key] = value;
	document.cookie = key + "=" + encodeURI(value) + "; expires=" + expires;
}
