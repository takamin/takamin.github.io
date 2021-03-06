/**
 * 桁数指定の四捨五入。
 * Math.roundの代わり。
 * @param n 四捨五入する桁を指定する。0なら結果は整数。10の位を四捨五入するなら2。
 * 		小数部での四捨五入は負の値を指定する。結果の小数点以下を2桁にしたいなら-2。
 */
Number.prototype.round = function(n) {
	if(n == undefined) { n = 0; }
	var pow = Math.pow(10, -n);
	return Math.round(this * pow) / pow;
}
Number.prototype.bin = function(columns) {
	var s = "";
	var n = this;
	while(n > 0) {
		var mod = n % 2;
		var h = "";
		if(mod) {
			h = "1";
		} else {
			h = "0";
		}
		s = h + s;
		n = Math.floor(n / 2);
	}
	if(columns) {
		s = (new Array(columns+1).join("0")) + s;
		s = s.substring(s.length - columns);
	}
	return s;
}
Number.prototype.hex = function(columns) {
    var s = this.toString(16);
    if(s.length > columns) {
        return s;
    }
    return ((new Array(columns)).join("0") + s).slice(-columns);
}
function number_format (number, decimals, dec_point, thousands_sep) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +     bugfix by: Michael White (http://getsprink.com)
	  // +     bugfix by: Benjamin Lupton
	  // +     bugfix by: Allan Jensen (http://www.winternet.no)
	  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	  // +     bugfix by: Howard Yeend
	  // +    revised by: Luke Smith (http://lucassmith.name)
	  // +     bugfix by: Diogo Resende
	  // +     bugfix by: Rival
	  // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
	  // +   improved by: davook
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +      input by: Jay Klehr
	  // +   improved by: Brett Zamir (http://brett-zamir.me)
	  // +      input by: Amir Habibi (http://www.residence-mixte.com/)
	  // +     bugfix by: Brett Zamir (http://brett-zamir.me)
	  // +   improved by: Theriault
	  // +      input by: Amirouche
	  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // *     example 1: number_format(1234.56);
	  // *     returns 1: '1,235'
	  // *     example 2: number_format(1234.56, 2, ',', ' ');
	  // *     returns 2: '1 234,56'
	  // *     example 3: number_format(1234.5678, 2, '.', '');
	  // *     returns 3: '1234.57'
	  // *     example 4: number_format(67, 2, ',', '.');
	  // *     returns 4: '67,00'
	  // *     example 5: number_format(1000);
	  // *     returns 5: '1,000'
	  // *     example 6: number_format(67.311, 2);
	  // *     returns 6: '67.31'
	  // *     example 7: number_format(1000.55, 1);
	  // *     returns 7: '1,000.6'
	  // *     example 8: number_format(67000, 5, ',', '.');
	  // *     returns 8: '67.000,00000'
	  // *     example 9: number_format(0.9, 0);
	  // *     returns 9: '1'
	  // *    example 10: number_format('1.20', 2);
	  // *    returns 10: '1.20'
	  // *    example 11: number_format('1.20', 4);
	  // *    returns 11: '1.2000'
	  // *    example 12: number_format('1.2000', 3);
	  // *    returns 12: '1.200'
	  // *    example 13: number_format('1 000,50', 2, '.', ' ');
	  // *    returns 13: '100 050.00'
	  // Strip all characters but numerical ones.
	  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	  var n = !isFinite(+number) ? 0 : +number,
	    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	    s = '',
	    toFixedFix = function (n, prec) {
	      var k = Math.pow(10, prec);
	      return '' + Math.round(n * k) / k;
	    };
	  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
	  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	  if (s[0].length > 3) {
	    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	  }
	  if ((s[1] || '').length < prec) {
	    s[1] = s[1] || '';
	    s[1] += new Array(prec - s[1].length + 1).join('0');
	  }
	  return s.join(dec);
	}
