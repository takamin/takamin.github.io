/*
 * name:
 * 	class TextboxWatcher
 * description:
 * 	テキストボックスの入力値をサイクリックにチェックして、変更されていたら即座に登録された関数を呼び出します。
 * 	機能的には既定のonchangeイベントをオーバーライドするものですが、それぞれ同時に動作します。
 * 	(既定のonchangeはフォーカスが外れたときにチェックが行われて必要なら呼び出されます)
 * author:	K.Takami 
 * created:	2011-08-03
 */

Element.prototype.setSize = function(w,h) {
	this.style.width  = "" + w + "px";
	this.style.height = "" + h + "px";
}
Element.prototype.setPosition = function(x,y) {
	this.style.left  = "" + x + "px";
	this.style.top = "" + y + "px";
}
Element.prototype.setFontSize = function(em) {
	this.style.fontSize  = "" + em + "em";
}

function TextboxWatcher() {}
TextboxWatcher.prototype.create = function(handler, objArray, DEBUG_ID) {
	try {
		this.checkCycleMillisec = 10;
		this.executeDurationMillisec = 200;
		
		this.handler = handler;
		this.objArray = objArray;
		this.lastValues = [];
		this.tid0 = undefined;
		this.tid1 = undefined;
		if(DEBUG_ID != undefined) {
			this.DEBUG_ID = DEBUG_ID;
			this.DEBUG = function(s) {
				var dt = new Date();
				var yy = dt.getFullYear();
				var f = function(v) {return ((v<10)?'0':'')+v;};
				var mm = f(dt.getMonth() + 1);
				var dd = f(dt.getDate());
				var hh = f(dt.getHours());
				var MM = f(dt.getMinutes());
				var ss = f(dt.getSeconds());
				var ms = dt.getMilliseconds();
				console.debug(
					'[' + yy+mm+dd+hh+MM+ss+"."+ms + ']' +
					"TextboxWatcher#" + this.DEBUG_ID + ":" + s);
			};
		} else {
			this.DEBUG = function(s) {/*無処理*/};
		}
	} catch(e) {
		alert(e);
	}
	return this;
}



TextboxWatcher.prototype.start = function() {
	try {
		this.DEBUG("start() START");
		this.resetChanges();
		for(var i = 0; i < this.objArray.length/*>*/; i++) {
			this.validateByIndex(i);
		}
		var THIS = this;
		this.tid0 = setInterval(
			function() { THIS.checkChanges(); },
			this.checkCycleMillisec);
		this.DEBUG("start() END");
	} catch(e) {
		alert("TextboxWatcher.prototype.start " + e);
	}
}
TextboxWatcher.prototype.validateByIndex = function(i) {
	//this.DEBUG("TextboxWatcher.prototype.validateByIndex(" + i + ') start');
	try {
		//console.debug(this.objArray[i].validator);
		if(this.objArray[i].validator != undefined) {
			//this.DEBUG("TextboxWatcher.prototype.validateByIndex(" + i + ') invoke validator');
			this.objArray[i].validator.call(this.objArray[i]);
		}
	} catch(e) {
		alert("TextboxWatcher.prototype.validateByIndex " + e);
	}
	//this.DEBUG("TextboxWatcher.prototype.validateByIndex(" + i + ') end');
}
TextboxWatcher.prototype.isDiff = function(a, b) {
	try {
		if(a != b) {
			return true;
		}
	} catch(e) {
		alert("TextboxWatcher.prototype.isDiff " + e);
	}
	return false;
}

TextboxWatcher.prototype.checkChanges = function () {
	try {
		//this.DEBUG("checkChanges() START");
		if(this.objArray == undefined) {
			return;
		}
		for(var i = 0; i < this.objArray.length/*>*/; i++) {
			//this.DEBUG("checkChanges() CHECK " + this.objArray[i].id);
			if(this.isDiff(this.lastValues[i], this.objArray[i].value)) {
				this.DEBUG("checkChanges() CHANGED!!! " + this.objArray[i].id);
				this.validateByIndex(i);
				this.onchange(this.objArray[i]);
				break;
			}
		}
		this.resetChanges();
		//this.DEBUG("checkChanges() END");
	} catch(e) {
		alert("TextboxWatcher.prototype.checkChanges " + e);
	}
}

TextboxWatcher.prototype.resetChanges = function () {
	try {
		this.lastValues = [];
		for(var i = 0; i < this.objArray.length/*>*/; i++) {
			this.lastValues.push(this.objArray[i].value);
		}
	} catch(e) {
		alert("TextboxWatcher.prototype.resetChanges " + e);
	}
}


TextboxWatcher.prototype.onchange = function(obj) {
	try {
		//this.DEBUG("onchange() START");
		if(this.tid1) {
			this.DEBUG("onchange() cancel");
			clearTimeout(this.tid1);
		}
		var THIS = this;
		this.tid1 = setTimeout(function() {
			//THIS.DEBUG("onchange() fire");
			THIS.tid1 = undefined;
			THIS.handler.call(obj);
			THIS.DEBUG("onchange() complete");
		}, this.executeDurationMillisec);
		//this.DEBUG("onchange() END");
	} catch(e) {
		alert("TextboxWatcher.prototype.onchange " + e);
	}
}



TextboxWatcher.prototype.stop = function() {
	if(this.tid0) {
		clearInterval(this.tid0);
		this.tid0 = undefined;
	}
}



///////////////////////////////////////////////////////////////////////////
// class TextBox
/////////////////////////////////////////////////////////////////////////////
function TextBox() {}


//===========================================================================
//テキストボックスを生成する
//===========================================================================
TextBox.prototype.create = function(textboxElement) {
	return this.createTextBox(textboxElement);
}
TextBox.prototype.createTextBox = function(textboxElement) {
	
	this.textbox = textboxElement;
	this.textbox.addClassName("TextBox");
	
	//要素が絶対位置指定されている場合はinput要素をdiv内に格納する
	if(this.textbox.style.position == "absolute") {
		var parent = textboxElement.parentNode;
		this.base = document.createElement('div');
		parent.insertBefore(this.base, this.textbox);
		parent.removeChild(this.textbox);
		this.base.appendChild(this.textbox);
		var left = PixNum(this.textbox.style.left);
		var top = PixNum(this.textbox.style.top);
		this.textbox.style.position = "static";
		this.setAbsPos(left, top);
	}
	
	//幅と高さを設定する
	if(this.textbox.style.width != undefined && this.textbox.style.width != ""
	&& this.textbox.style.height != undefined && this.textbox.style.height != "")
	{
		var width = PixNum(this.textbox.style.width);
		var height = PixNum(this.textbox.style.height);
		this.setSize(width, height);
	}
	
	//文字列編集時のハンドラーを設定する
	var oneditchange = this.textbox.getAttribute("oneditchange");
	if(oneditchange) {
		this.setOnEditChange(function() { eval(oneditchange); });
	}
	
	var THIS = this;
	this.textbox.setPosition = function(w,h) { THIS.setPosition(w,h); }
	this.textbox.setSize = function(w,h) { THIS.setSize(w,h); }
	this.textbox.setFontSize = function(p) { THIS.setFontSize(p); }
	return this;
}

//===========================================================================
//編集時文字列変更時のハンドラーをセットする
//===========================================================================
TextBox.prototype.setOnEditChange = function(oneditchange) {
	this.watcher = (new TextboxWatcher()).create(oneditchange, [ this.textbox ]);
	this.watcher.start();
}

//===========================================================================
//サイズを指定する。
//===========================================================================
TextBox.prototype.setSize = function (width, height) {
	this.width = width;
	this.height = height;
	if(this.base) {
		this.base.style.width = "" + this.width + "px";
		this.base.style.height = "" + this.height + "px";
	}
	this.textbox.style.width = "" + this.width + "px";
	this.textbox.style.height = "" + this.height + "px";
}
TextBox.prototype.setFontSize = function(em) {
	this.textbox.style.fontSize = "" + em + "em";
}
TextBox.prototype.setPosition = function(x,y) {
	this.left = x;
	this.top = y;
	this.base.style.left = "" + x + "px";
	this.base.style.top = "" + y + "px";
}

//===========================================================================
//絶対位置指定時のメソッド：絶対位置を指定する
//===========================================================================
TextBox.prototype.setAbsPos = function(x,y) {
	this.left = x;
	this.top = y;
	this.base.style.position = "absolute";
	this.base.style.left = "" + x + "px";
	this.base.style.top = "" + y + "px";
}

//===========================================================================
//絶対位置指定時のメソッド：表示する
//===========================================================================
TextBox.prototype.show = function() {
	this.base.style.visibility = "visible";
}

//===========================================================================
//絶対位置指定時のメソッド：隠す
//===========================================================================
TextBox.prototype.hide = function() {
	this.base.style.visibility = "hidden";
}


//===========================================================================
//ステータスラインへの情報表示
//===========================================================================
TextBox.prototype.setStatus = function(s) {
	var statusLineId = this.textbox.getAttribute("statusLineId");
	if(statusLineId) {
		var statusLine = document.getElementById(statusLineId);
		if(statusLine) {
			statusLine.innerHTML = s;
		}
	}
}


/////////////////////////////////////////////////////////////////////////////
// class SelectionTextBox
/////////////////////////////////////////////////////////////////////////////
function SelectionTextBox() {
}
SelectionTextBox.prototype = new TextBox();

//===========================================================================
//選択肢付きのテキストボックスを生成する
//===========================================================================
SelectionTextBox.prototype.create = function(textboxElement) {
	return this.createSelectionTextBox(textboxElement);
}
SelectionTextBox.prototype.createSelectionTextBox = function(textboxElement) {
	this.createTextBox(textboxElement);
	var popupId = this.textbox.getAttribute("popup");
	if(popupId) {
		this.createDropdownButton();
		this.popup = new PopupWindow();
		this.popupElement = document.getElementById(popupId);
		this.popup.create(this.popupElement);
		this.popup.createShadow(5,5);
		this.popup.hideByBackgroundClick();
	}
	return this;
}

//===========================================================================
//サイズを指定する。
//===========================================================================
SelectionTextBox.prototype.setSize = function (width, height) {
	var buttonWidth = 20;
	var buttonHeight = 20;
	this.width = width;
	this.height = height;
	if(this.base) {
		this.base.style.width = "" + this.width + "px";
		this.base.style.height = "" + this.height + "px";
	}
	this.textbox.style.width = "" + (this.width - buttonWidth - 4) + "px";
	this.textbox.style.height = "" + this.height + "px";
}

//===========================================================================
//ドロップダウンリストを生成する。
//===========================================================================
SelectionTextBox.prototype.createPopupList = function(width, height) {
	this.createDropdownButton();
	
	this.popupElement = document.createElement('div');
	this.popupElement.style.width = "" + width + "px";
	this.popupElement.style.height = "" + height + "px";
	
	this.popup = new PopupWindow();
	this.popup.create(this.popupElement);
	this.popup.createShadow(5,5);
	this.popup.hideByBackgroundClick();
}

//===========================================================================
//ドロップダウン用のボタンを生成する
//===========================================================================
SelectionTextBox.prototype.createDropdownButton = function() {
	var buttonWidth = 20;
	var buttonHeight = 20;
	this.textbox.style.width = "" + (this.width - buttonWidth - 4) + "px";
	this.ddButton = document.createElement('button');
	this.ddButton.innerHTML = '▼';
	this.ddButton.style.width = "" + buttonWidth + "px";
	this.ddButton.style.height = "" + buttonHeight + "px";
	this.ddButton.style.fontSize = '6pt';
	var THIS = this;
	this.ddButton.onclick = function() {
		var pos = getElementPosition(THIS.textbox);
		THIS.popup.show(pos.x, pos.y + THIS.height);
		return false;
	};
	this.textbox.parentNode.insertBefore(this.ddButton, this.textbox.nextSibling);
}

//===========================================================================
//候補の項目を追加する
//===========================================================================
SelectionTextBox.prototype.addPopupListItem = function(itemStr) {
	var THIS = this;
	var item = document.createElement('div');
	item.innerHTML = itemStr;
	item.style.cursor = "pointer";
	
	if(this.textbox.tagName == "INPUT") {
		item.onclick = function() {
			THIS.textbox.value = this.innerHTML;
			THIS.popup.hide();
		}
	} else if(this.textbox.tagName == "TEXTAREA") {
		item.onclick = function() {
			THIS.textbox.value += this.innerHTML;
			THIS.popup.hide();
		}
	}
	item.className = "TextBoxPopupListItem";
	this.popupElement.appendChild(item)
}



/////////////////////////////////////////////////////////////////////////////
//class NumberTextBox
/////////////////////////////////////////////////////////////////////////////
function NumberTextBox() {}
NumberTextBox.prototype = new TextBox();
//===========================================================================
//数値入力テキストボックスを生成する
//===========================================================================
NumberTextBox.prototype.create = function(element) {
	this.createTextBox(element);
	this.textbox.addClassName("Number");
	this.textbox.numberTextBoxObject = this;
	
	var vtor = element.getAttribute('validator');
	if(vtor != undefined && vtor != "") {
		this.textbox.validator = function() { eval( vtor ); };
	}
	this.setOnEditChange(function() {this.numberTextBoxObject.validate();});
	this.textbox.onblur = function() {this.numberTextBoxObject.onblur();}
	this.textbox.onfocus = function() {this.numberTextBoxObject.onfocus();}
	return this;
}
NumberTextBox.prototype.createEx = function(element) {
	this.createTextBox(element);
	this.textbox.addClassName("Number");
	this.textbox.numberTextBoxObject = this;
	
	var vtor = this.textbox.getAttribute('validator');
	this.textbox.validator = function() {
		this.numberTextBoxObject.validate();
		if(vtor != undefined && vtor != "") {
			eval( vtor );
		}
		this.onError();
	};
	var onerror = this.textbox.getAttribute("onError");
	this.textbox.onError = function() {
		if(onerror != undefined && onerror != "") {
			eval( onerror );
		}
	}
	
	this.textbox.onblur = function() {this.numberTextBoxObject.onblur();}
	this.textbox.onfocus = function() {this.numberTextBoxObject.onfocus();}
	return this;
}
//===========================================================================
//フォーカスを失った時の処理：数字をフォーマットして表示。整数部にはカンマを挿入
//===========================================================================
NumberTextBox.prototype.onblur = function() {
	if(this.parseInfo && this.parseInfo.error == false) {
		this.textbox.value = this.parseInfo.getFigureString(
			this.textbox.getAttribute("nocomma")
		);
	}
	this.setStatus("");
}
//===========================================================================
//フォーカス時の処理：カンマを削除して全選択
//===========================================================================
NumberTextBox.prototype.onfocus = function() {
	if(this.parseInfo && this.parseInfo.error == false) {
		this.textbox.value = this.parseInfo.getPlaneString();
	}
	this.textbox.select();
}
//===========================================================================
//数値入力テキストボックスの入力文字列チェック。
//===========================================================================
NumberTextBox.prototype.validate = function() {
	var s = this.textbox.value;
	this.setError(0,"");
	this.parseInfo = this.parse(s);
	if(this.parseInfo.error) {
		this.setError(-1,"数値を入力してください。");
//		this.setStatus("ERROR:入力値が数値でない");
	} else {
		var scale = this.textbox.getAttribute("scale");
		var min = this.textbox.getAttribute("min");
		var max = this.textbox.getAttribute("max");
		if(scale != undefined) {
			if(scale == "") {
				scale= "0";
			}
			if(this.parseInfo.fra_part.length > parseInt(scale)) {
				var nScale = parseInt(scale);
				var message = "";
				if(nScale == 0) {
					message = "整数を入力してください。"
				} else {
					message = "小数部の桁数が" + n + "桁以内の値を入力してください。";
				}
				this.setError(-2, message);
//				this.setStatus("ERROR:小数点以下桁数が多すぎる");
//				this.parseInfo.error = true;
			} else {
				while(this.parseInfo.fra_part.length < parseInt(scale)) {
					this.parseInfo.fra_part = this.parseInfo.fra_part + "0";
				}
			}
		}
		var value = this.parseInfo.getReal();
		if(min != undefined) {
			if(value < parseFloat(min)) {
				this.setError(-3,min + "以上の値を入力してください。");
//				this.setStatus("ERROR:最小値よりも小さい");
//				this.parseInfo.error = true;
			}
		}
		if(max != undefined) {
			if(value > parseFloat(max)) {
				this.setError(-4,max + "以下の値を入力してください。");
//				this.setStatus("ERROR:最大値よりも大きい");
//				this.parseInfo.error = true;
			}
		}
	}
//	if(this.parseInfo.error) {
//		this.textbox.addClassName("Error");
//	} else {
//		this.textbox.removeClassName("Error");
//	}
}
NumberTextBox.prototype.setError = function(eno, message) {
	if(!this.parseInfo) {
		this.parseInfo = {};
	}
	if(eno == 0) {
		this.parseInfo.error = false;
		this.textbox.removeClassName("Error");
	} else {
		this.parseInfo.error = true;
		this.textbox.addClassName("Error");
	}
	this.setStatus(message);
	this.parseInfo.eno = eno;
	this.parseInfo.message = message;
}
//===========================================================================
//数値入力テキストボックスの入力文字列チェック。
//===========================================================================

NumberTextBox.prototype.getValue = function() {
	var value = 0.0;
	this.validate();
	if(!this.parseInfo.error) {
		value = this.parseInfo.getReal();
	}
	return value;
}
NumberTextBox.prototype.setValue = function(value) {
	this.parseInfo = this.parse("" + value);
	if(!this.parseInfo.error) {
		this.textbox.value = this.parseInfo.getFigureString(
			this.textbox.getAttribute("nocomma")
		);
		this.validate();
	}
}

//===========================================================================
// 実数文字列を解析して解析情報を返します
//===========================================================================
NumberTextBox.prototype.parse = function(s) {
	
	var strSig = "";
	var strInt = "0";
	var strFra = "";

	var CODE0 = '0'.charCodeAt(0);
	var CODE9 = '9'.charCodeAt(0);
	
	var PARSE_IDLE = 0;
	var PARSE_SIG = 1;
	var PARSE_INT = 2;
	var PARSE_FRA = 3;
	var PARSE_TRAIL = 4;

	var stateParse = PARSE_IDLE;
	var c;
	var noError = true;
	var L = s.length;
	var i = 0;
	var firstZero = true;
	while(noError && i < L) {
		c = s.charAt(i);
		switch(stateParse) {
		case PARSE_IDLE:
			if(c == ' ' || c == "\t") {
				i++;
			} else {
				stateParse = PARSE_SIG;
			}
			break;
		case PARSE_SIG:
			if(c == '-' || c == '+') {
				strSig = c;
				i++;
				stateParse = PARSE_INT;
			} else {
				strSig = '+';
				stateParse = PARSE_INT;
			}
			break;
		case PARSE_INT:
			if(CODE0 <= c.charCodeAt(0) && c.charCodeAt(0) <= CODE9) {
				if(firstZero) {
					strInt = c;
					if(c != '0') {
						firstZero = false;
					}
				} else {
					strInt = strInt + c;
				}
				i++;
			} else if(c == ',') {
				i++;
			} else if(c == '.') {
				i++;
				stateParse = PARSE_FRA;
			} else {
				noError = false;
			}
			break;
		case PARSE_FRA:
			if(CODE0 <= c.charCodeAt(0) && c.charCodeAt(0) <= CODE9) {
				strFra = strFra + c;
				i++;
			} else if(c == ' ' || c == "\t") {
				stateParse = PARSE_TRAIL;
			} else {
				noError = false;
			}
			break;
		case PARSE_TRAIL:
			if(c == ' ' || c == "\t") {
				i++;
			} else {
				noError = false;
			}
			break;
		}
	}
	if(noError) {
		strFra = this.trimRight(strFra, "0");
	}
	
	return {
		src:s,
		sig_part:strSig,
		int_part:strInt,
		fra_part:strFra,
		error:!noError,
		char_pos:i,
		state:stateParse,
		eno:0,
		message:"",
		getReal:function () {
			var s = this.sig_part;
			s += this.int_part;
			s += "." + this.fra_part + "0";
			return parseFloat(s);
		},
		getPlaneString:function() {
			return ((this.sig_part=="-")?"-":"")
			+ this.int_part
			+ ((this.fra_part=="")?"":".")
			+ this.fra_part;
		},
		getFigureString: function(nocomma) {
			var str = this.int_part;
			var num = new String(str).replace(/,/g, "");
			if(nocomma == null || nocomma == undefined || !nocomma) {
				while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
			}
			str = num;
			return ((this.sig_part=="-")?"-":"")
				+ str
				+ ((this.fra_part=="")?"":".")
				+ this.fra_part;
		}
	};
}

//===========================================================================
// 文字列Sの右端にある連続したcの文字を取り除いた文字列を返します。
//===========================================================================
NumberTextBox.prototype.trimRight = function(s, c) {
	var L = s.length;
	var i = s.length;
	var match = true;
	var dstS = "";
	while(--i >= 0) {
		if(match) {
			match = (s.charAt(i) == c);
		}
		if(!match) {
			dstS = s.charAt(i) + dstS;
		}
	}
	return dstS;
}


/////////////////////////////////////////////////////////////////////////////
//class TextBoxForDatePicker
/////////////////////////////////////////////////////////////////////////////
function TextBoxForDatePicker() {}
TextBoxForDatePicker.prototype = new TextBox();
TextBoxForDatePicker.prototype.setSize = function (width, height) {
	var buttonWidth = 24;
	var buttonHeight = 20;
	this.width = width;
	this.height = height;
	if(this.base) {
		this.base.style.width = "" + this.width + "px";
		this.base.style.height = "" + this.height + "px";
	}
	this.textbox.style.width = "" + (this.width - buttonWidth - 4) + "px";
	this.textbox.style.height = "" + this.height + "px";
}



function NumberTextboxWatcher() {}
NumberTextboxWatcher.prototype = new TextboxWatcher();
NumberTextboxWatcher.prototype.isDiff = function(statA, statB) {
	try {
		if(statA.error && !statB.error || !statA.error && statB.error) {
			return true;
		}
		if(!statA.error && !statB.error) {
			if(statA.getReal() != statB.getReal()) {
				return true;
			}
		}
	} catch(e) {
		alert(e);
	}
	return false;
}
NumberTextboxWatcher.prototype.checkChanges = function () {
	try {
		//this.DEBUG("checkChanges() START");
		if(this.objArray == undefined) {
			return;
		}
		for(var i = 0; i < this.objArray.length/*>*/; i++) {
			//this.DEBUG("checkChanges() CHECK " + this.objArray[i].id);
			var numText = this.objArray[i].numberTextBoxObject;
			var statA = numText.parse(this.lastValues[i]);
			var statB = numText.parse(this.objArray[i].value);
			if(this.isDiff(statA, statB)) {
				this.DEBUG("checkChanges() CHANGED!!! " + this.objArray[i].id);
				this.validateByIndex(i);
				this.onchange(this.objArray[i]);
				break;
			}
		}
		this.resetChanges();
		//this.DEBUG("checkChanges() END");
	} catch(e) {
		alert("EEE " + e);
	}
}

