/**
 * 全てのdiv.awsAsinImage に MediumImageを読み込む。
 * 属性ASINにASINが設定されていること
 */
$(function() {
	//一回のリクエストで行うため。重いサーバーではかなり待つことになる。
	var ids = [];
	var ASINs = [];
	$(".awsAsinImage").each(function(){
		ids.push(this);
		ASINs.push($(this).attr("ASIN"));
	});
	if(ASINs.length > 0) {
		writeMediumImage(ids,ASINs);
	}
});
/**
 * ItemLookupリクエストで商品を検索し、指定要素に画像を表示しリンクする
 * @param element 画像を表示するコンテナ要素。配列で複数の要素も受け付ける。
 * @param itemId アイテムのID。デフォルトはASIN。配列で複数指定しても良い。
 * 				この場合、画像はコンテナのID配列と順序が同じコンテナに表示される。
 * @param params アイテムID以外のパラメータ連想配列
 */
function writeMediumImage(element, itemId, params) {
	if(params==undefined) {
		params = {Idtype:"ASIN"};
	}
	if($.isArray(element)) {
		itemId = itemId.join(',');
	}
	params = {
		ItemId:itemId,
		ResponseGroup:"Small,Images"
	};
	aws_getItemLookup(
		params, 
		function(response) { 
			drawMediumImage(element, response);
		}
	);
}

/**
 * ItemLookupのレスポンスで画像を出力
 * @param id
 * @param response
 */
function drawMediumImage(element, response) {
	if($.isArray(element)) {
		jQuery.each(response.Items.Item, function(i, item){
			$(element[i]).text("").append(
				$("<a/>").attr("target","_blank").attr("href", item.DetailPageURL)
				.append(
					$("<img/>")
					.attr("src", item.MediumImage.URL)
					.attr("width", item.MediumImage.Width)
					.attr("height", item.MediumImage.Height)
				)
			);
		});
	} else {
		var item = response.Items.Item[0];
		$(element).text("").append(
			$("<a/>").attr("target","_blank").attr("href", item.DetailPageURL)
			.append(
				$("<img/>")
				.attr("src", item.MediumImage.URL)
				.attr("width", item.MediumImage.Width)
				.attr("height", item.MediumImage.Height)
			)
		);
	}
}


/**
 * ItemSearchリクエストで本を検索し、指定IDに単純な検索結果のリストを表示
 * @param element 要素
 * @param params
 */
function writeSimpleBookList(element, params) {
	params.SearchIndex	= "Books";//本を検索する
	if(typeof doLater != "undefined") {
		doLater(function() {
			aws_getItemSearch(
					params, 
					function(response) { 
						drawSimpleBookList(element, response, DrawerItemSearch_SimpleText_Book);
					}
				);
		},2000);
	} else {
		aws_getItemSearch(
				params, 
				function(response) { 
					drawSimpleBookList(element, response, DrawerItemSearch_SimpleText_Book);
				}
			);
	}
}

/**
 * ItemSearchのレスポンスによって、指定要素に単純な検索結果のリストを表示
 * @param element 要素
 * @param response
 * @param drawer
 */
function drawSimpleBookList(element, response, drawer) {
	if(drawer == undefined) {
		drawer = DrawerItemSearch_SimpleText_Book;
	}
	if(response.Items.Request.Errors == undefined) {
		var items = response.Items.Item;
		var ItemSearchResultList = $(element).text("").append("<ol>");
		jQuery.each(items, function(i, item) {
			var itemAttr = item.ItemAttributes;
			if(drawer != undefined) {
				if(itemAttr != undefined) {
					var li = $("<li>");
					if(drawer.drawLink && itemAttr.Title && item.DetailPageURL) {
						drawer.drawLink(li, item);
					}
					if(drawer.drawAuthor && itemAttr.Author) {
						drawer.drawAuthor(li, itemAttr.Author, element);
					}
					if(drawer.drawManufacturer && itemAttr.Manufacturer) {
						drawer.drawManufacturer(li, itemAttr.Manufacturer, element);
					}
					if(drawer.drawCreator && itemAttr.Creator) {
						drawer.drawCreator(li, itemAttr.Creator, element);
					}
					ItemSearchResultList.append(li);
				}
			}
		});
	}
}

var DrawerItemSearch_SimpleText_Book = {
		drawLink: function(li, item) {
			li.append(
					$("<a>")
					.attr("target", "_blank")
					.attr("href", item.DetailPageURL)
					.text("「" + item.ItemAttributes.Title + "」  ")
				);
		},
		drawAuthor: function(li, itemAuthors, element) {
			li.append("著者:");
			jQuery.each(itemAuthors, function(i, value) {
				li.append($("<a>").text(value).attr('href', 'javascript:void(0);')
					.click(	function() {writeSimpleBookList(element, {Author:value});}));
				if(i < itemAuthors.length - 1) {
					li.append(", ");
				}
			});
			li.append(" ");
		},
		drawManufacturer: function(li, itemManufacturers, element) {
			li.append("出版社:");
			jQuery.each(itemManufacturers, function(i, value) {
				li.append($("<a>").text(value).attr('href', 'javascript:void(0);')
					.click(	function() {writeSimpleBookList(element, {Publisher:value});}));
				if(i < itemManufacturers.length - 1) {
					li.append(", ");
				}
			});
			li.append(" ");
		},
		drawCreator: function(li, itemCreators, element) {
			li.append("監修・翻訳:");
			jQuery.each(itemCreators, function(i, value) {
				li.append($("<a>").text(value).attr('href', 'javascript:void(0);')
					.click(	function() {writeSimpleBookList(element, {Author:value});}));
				if(i < itemCreators.length - 1) {
					li.append(", ");
				}
			});
			li.append(" ");
		}
	};

//=======================================================================
// ItemSearch
//=======================================================================

/**
 * ItemSearchリクエストを行う
 */
function aws_getItemSearch(params, callback) {
	params.Operation = "ItemSearch";
	aws_get(params, function(response) {
		response = preformatItemSearchResponse(response);
		callback(response);
	});
}

/**
 * ItemSearchレスポンスのプリプロセス
 * @param response
 * @returns
 */
function preformatItemSearchResponse(response) {
	response = preformatItemResponse(response.ItemSearchResponse);
	return response;
}

//=======================================================================
// ItemLookup
//=======================================================================

/**
 * ItemLookupリクエストを行う
 */
function aws_getItemLookup(params, callback) {
	params.Operation = "ItemLookup";
	aws_get(params, function(response) {
		response = preformatItemLookupResponse(response);
		callback(response);
	});
}

/**
 * ItemLookupレスポンスのプリプロセス
 * @param response
 * @returns
 */
function preformatItemLookupResponse(response) {
	response = preformatItemResponse(response.ItemLookupResponse);
	return response;
}

/**
 * AWSのRESTリクエストを行い、レスポンスをJSONで受け取る
 * @param params
 * @param callback
 * @return
 */
aws_wait_count = 0;
aws_request = [];
aws_requester_id = undefined;
function aws_get(params, callback) {
	aws_request.push(function () {_aws_get(params, callback);});
	if(aws_requester_id == undefined) {
		aws_requester_id = window.setInterval(
			function() {
				if(aws_request.length == 0) {
					if(++aws_wait_count > 60) {
						window.clearInterval(aws_requester_id);
						aws_requester_id = undefined;
						aws_wait_count = 0;
					}
				} else {
					aws_request.shift().call();
				}
			},
			1 /*1000*/
		);
		aws_request.shift().call();
	}
	return false;
}
function _aws_get(params, callback) {
	var arr = [];
	for(var name in params) {
		arr.push(name + '=' + encodeURI(params[name]));
	}
	var url_prefix = 'http://bicycle.life.coocan.jp';
	if(document.location.host == '127.0.0.1') {
		url_prefix = 'http://127.0.0.1/bicycle.life.coocan.jp';
	}
	var uri = url_prefix + '/takamints/index.php/aws/get.php?' + arr.join('&');
	$.ajax({
		type:"GET", url:uri, dataType:"text",
		success: function(data) {
			try {
				var response = eval('(' + data + ')');
				callback(response);
			} catch(e) {
				//例外は無視
			}
		}
	});
}
//=======================================================================
// レスポンスの処理
//=======================================================================

/**
 * AWSレスポンスを整形する。本来配列として定義されていても要素がひとつだけ含まれている場合は配列になっていないため、これを是正する。
 * ItemSearchとItemResponseに対応している。
 * @param response
 * @returns 整形後のレスポンス
 */
function preformatItemResponse(response) {
	//結果が一件の場合ItemSearchResponse.Items.Itemを一要素の配列にする
	if(response.Items.Request.IsValid == "True") {
		response.Items.Item = toArray(response.Items.Item);
	}
	if(response.Items.Request.Errors == undefined) {
		var items = response.Items.Item;
		for(var i = 0; i < items.length; i++) {
			var item = items[i]; 
			if(item.ItemAttributes) {
				item.ItemAttributes.Author = toArray(item.ItemAttributes.Author);
				item.ItemAttributes.Creator = toArray(item.ItemAttributes.Creator);
				item.ItemAttributes.Manufacturer = toArray(item.ItemAttributes.Manufacturer);
			}
		}
	}
	return response;
}

// Items/Item
// Items/Item/ItemAttributes/Author
// Items/Item/ItemAttributes/Creator
// Items/Item/ItemAttributes/Manufacturer
/**
 * 配列以外のオブジェクトを要素ひとつの配列に変換する。ただしundefinedは配列に変換しない。
 * @param obj
 * @returns
 */
function toArray(obj) {
	return (obj != undefined && !$.isArray(obj)) ? [obj]:obj;
}

/**
 * javascriptのobjectをJSON文字列化（改行とインデントする）
 * 
 * @param obj
 * @param outstr
 * @param indent
 * @returns
 */
function toJson(obj, outstr, indent) {
	var getIndent = function(n) { var s = ""; for(var i = 0; i < n; i++) { s += "  "; } return s;}
	var toJson_ = function (obj, outstr, indent) {
		var I1 = getIndent(indent);
		var I2 = getIndent(indent + 1);
		var cr = "\r\n";
		if(obj == null) {
			outstr += "null";
		} else if($.isArray(obj)) {
			outstr += "[" + cr;
			for(var i = 0; i < obj.length; i++) {
				outstr += I2 + toJson_(obj[i], "", indent + 1);
				if(i < obj.length - 1) { outstr += ","; }
				outstr += cr;
			}
			outstr += I1;
			outstr += "]";
		} else if(typeof obj == 'object') {
			outstr += "{" + cr;
			var keys = [];
			for(var key in obj) {keys.push(key);}
			for(var i = 0; i < keys.length; i++) {
				var key = keys[i];
				outstr += I2 + key + '=' + toJson_(obj[key], "", indent + 1);
				if(i < keys.length - 1) {outstr += ",";}
				outstr += cr;
			}
			outstr += I1;
			outstr +=  "}";
		} else if(typeof obj == 'undefined') {
			outstr += 'undefined';
		} else if(typeof obj == 'string') {
			outstr += '"' + obj + '"';
		} else {
			outstr += obj;
		}
		return outstr;
	}
	return toJson_(obj, "", 0);
}

/**
 * Formの中身をハッシュに変換する
 * @param form
 * @returns {Array}
 */
function aws_form_to_hash(form) {
	var params = [];
	for(var i = 0; i < form.elements.length; i++) {
		var element = form.elements[i];
		if(element.type != undefined && element.type != "submit" && element.type != "reset") {
			var name  = element.name;
			var value = element.value;
			if(name != "" && value != "") {
				params[name] = value;
			}
		}
	}
	return params;
}

