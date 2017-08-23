takamints = {
	//試験環境と本番環境でURL切り替え（デバッグ用）
	is_local : function() {
		return (document.location.host == '127.0.0.1');
	}(),
	//試験環境と本番環境でURL切り替え（デバッグ用）
	url_prefix : function() {
		return (document.location.host == '127.0.0.1')
			?'http://127.0.0.1/bicycle.life.coocan.jp'
			:'http://bicycle.life.coocan.jp';
	}(),
	//JSONPサポート
	jsonp : {
		seq : 0, map : {},
		//jsonpの実行
		execute: function(url, callback) {
			var id = 'takamints_jsonp' + takamints.jsonp.seq;
			takamints.jsonp.seq++;
			takamints.jsonp.map[id] = callback;
			var s = document.createElement('script');
			if(url.indexOf('?') < url.length - 1) {
				url += '&';
			} 
			s.id = id;
			s.src = url + 'callback=takamints.jsonp.callback&jsonpId=' + id;
			s.type = 'text/javascript';
			document.body.appendChild(s);
		},
		//jsonpのコールバック
		callback: function(id, param) {
			var callback = takamints.jsonp.map[id];
			delete takamints.jsonp.map[id];
			var s = document.getElementById(id);
			if(s) {
				s.parentNode.removeChild(s);
			}
			callback.call(null, param);
		}
	},
	//和暦変換
	toWareki : function(strDate, callback) {
		var jsonpUrl = takamints.url_prefix + '/takamints/index.php/wareki/';
		takamints.jsonp.execute(jsonpUrl + 'toWareki?d=' + strDate, callback);
	}
};
function onResize() {
	var bodyContentPane = $("#docBody > div").get(0);
	var strWidth = bodyContentPane.getEffectiveWidth();
	var width = parseInt(strWidth);
	if($(".rightSideSub").length > 0) {
		if(width >= 350-32) {
			if(width < 760-32) {
				width -= 140;
			} else {
				width = 760 - 32 - 140;
			}
		}
	}
	$("#docBody > div > .content").css("width",  width + 'px');
}
$(function() {
	onResize();
	$(window).resize(onResize);
});
