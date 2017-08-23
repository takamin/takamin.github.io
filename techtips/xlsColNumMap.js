$(function() {
	//列名テキストボックス
	var txtColName = (new TextBox()).create($("#txtColName")[0]);
	txtColName_changingByCode = false;
	txtColName.setOnEditChange(function() {
		var THIS = this;
		//doLater(function() {
			if(!txtColName_changingByCode) {
				txtColNumber_changingByCode = true;
				if(!isAlpha(THIS.value)) {
					txtColNumber.textbox.value = '';
				} else {
					var nam = THIS.value;
					var num = getColNumber(nam);
					txtColNumber.textbox.value = num;
					
					myScrlbar_changingByCode = true;
				    $('#myScrlbar').scrlbarPos(num);
				}
			}
			txtColName_changingByCode = false;
		//},500);
	});
	
	//列番号テキストボックス
	var txtColNumber = (new NumberTextBox()).create($("#txtColNumber")[0]);
	var txtColNumber_changingByCode = false;
	txtColNumber.setOnEditChange(function() {
		var THIS = this;
			if(!txtColNumber_changingByCode) {
				txtColName_changingByCode = true;
				if(!isNum(THIS.value) || THIS.value < org()) {
					txtColName.textbox.value = "";
				} else {
					var num = THIS.value;
					var nam = getColName(num);
					txtColName.textbox.value = nam;
					
					myScrlbar_changingByCode = true;
				    $('#myScrlbar').scrlbarPos(num);
				}
			}
			txtColNumber_changingByCode = false;
	});
	
	myScrlbar_changingByCode = false;
	createScrlbar(org() + 16383, org());
	$("#myScrlbar").scroll(function() {
		if(!myScrlbar_changingByCode) {
		    var num = $("#myScrlbar").scrlbarPos();
			var nam = getColName(num);
			
		    txtColNumber_changingByCode = true;
		    txtColNumber.textbox.value = num;
		    
		    txtColName_changingByCode = true;
		    txtColName.textbox.value = nam;
		}
		myScrlbar_changingByCode = false;
	});	
	txtColName.textbox.value = "A";
	
	
	$("table.colnummap tbody tr:even td:even").css('background-color', '#eed');
	$("table.colnummap tbody tr:even td:odd").css('background-color', '#ffe');
	$("table.colnummap tbody tr:odd td:even").css('background-color', '#dee');
	$("table.colnummap tbody tr:odd td:odd").css('background-color', '#eff');
});

function createScrlbar(maxValue, pos) {
    $('#myScrlbar').scrlbar({
        dir:'h',        //方向の指定
        width:700,      	//画面上の幅。ピクセル単位。
        minValue:org(),    	//スクロールバーのつまみが左端の時の論理値
        maxValue:maxValue,   //スクロールバーのつまみが右端の時の論理値
        pageLen:15,     //つまみの大きさを論理値で指定
        value:pos         //初期のつまみの位置を論理値で指定
        });
}

var CHAR_CODE_A = "A".charCodeAt(0);
var CHAR_CODE_Z = "Z".charCodeAt(0);

/**
 * 文字列がすべてアルファベットかどうかを判定する。
 * @param value
 * @returns {Boolean}
 */
function isAlpha(value) {
	value = value.toUpperCase();
	var valid = true;
	for(var i = 0; i < value.length; i++) {
		var cc = value.charCodeAt(i);
		if(cc < CHAR_CODE_A || CHAR_CODE_Z < cc) {
			return false;
		} 
	}
	return true;
}

var CHAR_CODE_0 = "0".charCodeAt(0);
var CHAR_CODE_9 = "9".charCodeAt(0);

/**
 * すべての文字が数字かどうかを判定する。
 * @param value
 * @returns {Boolean}
 */
function isNum(value) {
	var valid = true;
	for(var i = 0; i < value.length; i++) {
		var cc = value.charCodeAt(i);
		if(cc < CHAR_CODE_0 || CHAR_CODE_9 < cc) {
			return false;
		} 
	}
	return true;
}

/**
 * 列名の桁
 */
var NAME_COLUMN_VALUES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

/**
 * 桁の数
 */
var NAME_COLUMN_VALUES_LENGTH = NAME_COLUMN_VALUES.length;

/**
 * 数値を列名に変換
 * @param num
 * @returns {String}
 */
function getColName(num) {
	var s = "";
	var col = 0;
	do {
		if(org() != 0 || col > 0) {
			num--;
		}
		var mod = num % NAME_COLUMN_VALUES_LENGTH;
		s = NAME_COLUMN_VALUES[mod] + s;
		num = Math.floor(num / NAME_COLUMN_VALUES_LENGTH);
		col++;
	} while(num > 0);
	return s;
}

/**
 * 列名を列番号に変換
 * @param name
 * @returns {Number}
 */
function getColNumber(name) {
	var num = 0;
	var s = name.toUpperCase().split('');
	$.each(s, function(i, c) {
		var n = $.inArray(c, NAME_COLUMN_VALUES);
		if(org() != 0 || i < s.length - 1) {
			n++;
		}
		num = num * 26 + n;
	});
	return num;
}
