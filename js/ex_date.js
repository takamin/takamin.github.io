Date.prototype.format = function(fmt) {
	var s = '';
	var L = fmt.length;
	for(var i = 0; i < L; i++) {
		var c = fmt.charAt(i);
		switch(c) {
		case 'Y':
			s += ('0000' + this.getFullYear().toString()).right(4);
			break;
		case 'm':
			s += ('00' + (this.getMonth() + 1).toString()).right(2);
			break;
		case 'd':
			s += ('00' + this.getDate().toString()).right(2);
			break;
		case 'H':
			s += ('00' + this.getHours().toString()).right(2);
			break;
		case 'i':
			s += ('00' + this.getMinutes().toString()).right(2);
			break;
		case 's':
			s += ('00' + this.getSeconds().toString()).right(2);
			break;
		default:
			s += c;
			break;
		}
	}
	return s;
}
