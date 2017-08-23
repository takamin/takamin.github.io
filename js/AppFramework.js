/////////////////////////////////////////////////////////////////////////////
//Webアプリケーションのフレームワーク
// require cookie.js, easing.js
/////////////////////////////////////////////////////////////////////////////
function AppFramework() {}

/////////////////////////////////////////////////////////////////////////////
//HTMLのノードを指定してアプリケーションフレームワークを構築する。
/////////////////////////////////////////////////////////////////////////////
AppFramework.prototype.create = function($root_node) {
	
//	//localStorageに保存したオブジェクトのうち、古い30%を削除する。
//	this.discardOldDataInLocalStorage(10);
	
	//localStorageの期限切れオブジェクトの破棄
	this.removeExpiredObjectAll();

	$root_node = $root_node || $('body');
	this.$root_node = $root_node;
	
	//button要素のclickイベント処理
	this.setElementHandler('button', 'click');

	//button要素のclickイベント処理
	this.setElementHandler('a.button', 'click');
	$("a.button").attr('href', 'javascript:void(0);');
	
	//checkbox要素のchangeイベント処理
	this.setElementHandler('input[type=checkbox]', 'change');

	//radio要素のchangeイベント処理
	this.setElementHandler('input[type=radio]', 'change');

	//select要素のchangeイベント処理
	this.setElementHandler('select', 'change');
	
	return this;
};

/////////////////////////////////////////////////////////////////////////////
//タグ名で指定した画面内の要素のイベントハンドラーを検索して登録する
//要素にはIDが設定されており、派生クラスのPageクラスに <id>_<eventName>の
//メソッドが定義されている場合に登録する。
/////////////////////////////////////////////////////////////////////////////
AppFramework.prototype.setElementHandler = function(tagName, eventName) {
	var THIS = this;
	this.$root_node.find(tagName).each(function (index, element) {
		if (element.id) {
			var idPrefix = element.id.split('-')[0];
			var hdl = THIS[idPrefix + '_' + eventName];
			if (hdl) {
				THIS[element.id] = element;
				$(element).unbind(eventName);//一旦削除する
				$(element).bind(eventName, 
						function () { hdl.call(THIS, element); });
			}
		}
	});
}

AppFramework.prototype.getJson = function(url, param, callback) {
	var paramarr = [];
	$.each(param, function(key, value) {
		paramarr.push(key + '=' + value);
	});
	if(paramarr.length > 0) {
		url = url + '?' + paramarr.join('&');
	}
	$.ajax({
		type:"GET", url:url, dataType:"text",
		success: function(data) {
			try {
				var response = eval('(' + data + ')');
				callback(response);
			} catch(e) {
				console.error(
						"AppFramework.getJson: EXCEPTION " + 
						"url:" + url + ", " + e);
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.error(
					"AppFramework.getJson: ERROR " + 
					"url=" + url + ", " +
					"textStatus=" + textStatus + ", " + 
					"errorThrown=" + errorThrown);
		}
	});
}

AppFramework.prototype.setupWindowScrollTopSaver = function(varName) {
	if(COOKIE) {
		var cookie = new COOKIE();
		if(cookie.exists(varName)) {
			var scrlTop = cookie.get(varName);
			this.setWindowScrollTop(scrlTop, 0);
		}
		//ウィンドウがスクロールされたらクッキーに保持する
		$(window).scroll(function(obj) {
			cookie.set(varName, $(window).scrollTop());
		});
	}
}

AppFramework.prototype.setWindowScrollTop = function(scrlTopTo, duration) {
	if(duration == 0) {
		$(window).scrollTop(scrlTopTo);
	} else {
		var scrlTopFrom = $(window).scrollTop();
		easing(scrlTopFrom, scrlTopTo, duration, 
				function (scrlTop) { $(window).scrollTop(scrlTop);});
	}
}

/**
 * 有効期限付きでobjectをlocalStorageへ保存する。
 * objectはJSONとして保存される。
 * @param key キー(文字列)
 * @param obj 保存するオブジェクト
 * @param expireSpan 有効期間をミリ秒で指定する。
 */
AppFramework.prototype.saveObjectWithTimeLimit = function(key, obj, expireSpan) {
	if(expireSpan == null) {
		expireSpan = 60 * 30 * 1000;
	}
	var now = new Date().getTime();
	var cacheObj = {
			"expired": now + expireSpan,
			"content": obj
	};
	try {
		this.saveObject(key, cacheObj);
	} catch(e) {
		this.discardOldDataInLocalStorage(30);
		try {
			this.saveObject(key, cacheObj);
		} catch(e) {
			console.error("Exception caught in AppFramework.saveObject : " + e);
		}
	}
};

/**
 * 有効期限付きで保存されたオブジェクトを読み出す。
 * 有効期限が過ぎていればnullを返す。
 * @param key キー(文字列)
 * @returns object。
 */
AppFramework.prototype.restoreObjectWithTimeLimit = function(key) {
	var obj = null;
	this.removeExpiredObject(key);
	var cacheObj = this.restoreObject(key);
	if(cacheObj != null) {
		if('expired' in cacheObj) {
			if('content' in cacheObj) {
				obj = cacheObj.content;
			}
		}
	}
	return obj;
};

/**
 * 有効期限付きで保存されたオブジェクトを更新する。
 * 有効期限は更新しない。
 * @param key キー(文字列)
 * @param obj object
 */
AppFramework.prototype.updateObjectWithTimeLimit = function(key, obj) {
	this.removeExpiredObject(key);
	var cacheObj = this.restoreObject(key);
	if(cacheObj != null) {
		if(cacheObj.expired < new Date().getTime()) {
			cacheObj = null;
		} else {
			cacheObj.content = obj;
		}
		this.saveObject(key, cacheObj);
	}
};

/**
 * localStorageに保存された期限付きオブジェクトの古いデータを削除。
 * @param key キー(文字列)
 * @param obj object
 */
AppFramework.prototype.discardOldDataInLocalStorage = function(discardRatio) {
	console.log("discard old " + discardRatio + "% objects in LocalStorage...");
	var key2exp = [];
	for(var key in localStorage) {
		var obj = this.restoreObject(key);
		if(obj != null && 'expired' in obj) {
			key2exp.push({'key': key, 'expired' : obj.expired});
		}
	}
	for(var i = 0; i < key2exp.length; i++) {
		for(var j = i + 1; j < key2exp.length; j++) {
			if(key2exp[j].expired < key2exp[i].expired) {
				var tmp = key2exp[i];
				key2exp[i] = key2exp[j];
				key2exp[j] = tmp;
			}
		}
	}
	for(var i = 0; i < key2exp.length * discardRatio / 100; i++) {
		this.saveObject(key2exp[i].key, null);
	}
};

/**
 * localStorageから、全ての有効期限が過ぎたオブジェクトを削除する。
 * @param key キー(文字列)
 * @param obj object
 */
AppFramework.prototype.removeExpiredObjectAll = function() {
	for(var key in localStorage) {
		this.removeExpiredObject(key);
	}
};

/**
 * localStorageから、有効期限が過ぎたオブジェクトを削除する。
 * @param key キー(文字列)
 */
AppFramework.prototype.removeExpiredObject = function(key) {
	var obj = this.restoreObject(key);
	var now = new Date().getTime();
    try {
        if(obj != null && 'expired' in obj) {
            if(obj.expired < now) {
                this.saveObject(key, null);
            }
        }
    } catch(e) {
        console.error("Exception caught in AppFramework.removeExpiredObject : " + e);
    }
};

AppFramework.prototype.saveObject = function(key, obj) {
	if(window.localStorage) {
        if(obj == null) {
            if(window.localStorage.getItem(key) != null) {
                window.localStorage.removeItem(key);
            }
        } else {
            var json = JSON.stringify(obj);
            window.localStorage.setItem(key, json);
        }
	}
};

AppFramework.prototype.restoreObject = function(key) {
	var obj = null;
	if(window.localStorage) {
		var json = null;
		json = window.localStorage.getItem(key);
		if(json != null) {
			try {
                var item = JSON.parse(json);
                if(typeof(item) === 'object') {
                    obj = item;
                }
			} catch(e) {
				console.info("Fail to JSON.parse('" + json + "') - exception " + e);
			}
		}
	}
	return obj;
};
