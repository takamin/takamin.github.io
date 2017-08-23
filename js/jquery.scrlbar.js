/**
 * シンプルなスクロールバープラグイン。
 * K.Takami 2012-09-06(THU)
 */
jQuery(document).ready(function() {
	//=======================================================================
	//プラグインの定義
	//=======================================================================
	jQuery.fn.scrlbar = function(option) {
		return this.each(function() {
			//選択された全要素を元にスクロールバークラスを生成
            new jQuery.scrlbar( this , option);
        });
	}
	//=======================================================================
	//論理単位のスクロール量を取得・設定
	//=======================================================================
	jQuery.fn.scrlbarPos = function(pos) {
		if(pos != undefined) {
			//値を設定
			return this.scrlbarPxPos(this.scrlbarPosToPx(pos));
		}
		//値を取得
		return this.scrlbarPxToPos(this.scrlbarPxPos());
	}
	//=======================================================================
	//ピクセル単位のスクロール量を取得・設定
	//=======================================================================
	jQuery.fn.scrlbarPxPos = function(px) {
		if(px != undefined) {
			//値を設定
			return this.each(function(){
				var sb = $(this);
				switch(sb.attr('dir')) {
					case 'h': sb.scrollLeft(px); break;
					case 'v': sb.scrollTop(px); break;
				}
			});
		}
		//値を取得
		switch(this.attr('dir')) {
			case 'h': px = this.scrollLeft(); break;
			case 'v': px = this.scrollTop(); break;
		}
		return px; 
	}
	jQuery.fn.scrlbarViewport = function(pxViewportLen) {
		if(pxViewportLen != undefined) {
			return this.each(function(){
				var sb = $(this);
				switch(sb.attr('dir')) {
				case "h": sb.css('width', pxViewportLen + 'px'); break;
				case "v": sb.css('height', pxViewportLen + 'px'); break;
				}
				//sb.attr('pxViewportLen', pxViewportLen);
			});
		} else {
			pxViewportLen = $(this.get(0)).attr('pxViewportLen');
		} 
		return pxViewportLen;
	}

	//=======================================================================
	//ピクセル単位から論理単位への変換
	//=======================================================================
	jQuery.fn.scrlbarPxToPos = function(px) {
		var pageLen = this.attr('pageLen');
		var minValue = parseInt(this.attr('minValue'));
		var maxValue = parseInt(this.attr('maxValue'));
		var pxViewportLen = this.attr('pxViewportLen');
		var pos = 0;
		if(maxValue < minValue) {
			var valueLen = minValue - maxValue;
			var pxContentLen = Math.floor(pxViewportLen * valueLen / pageLen);
			pos = Math.floor(minValue - valueLen * px / pxContentLen);
		} else {
			var valueLen = maxValue - minValue;
			var pxContentLen = Math.floor(pxViewportLen * valueLen / pageLen);
			pos = Math.floor(minValue + valueLen * px / pxContentLen);
		}
		return pos;
	},
	//=======================================================================
	//論理単位からピクセル単位への変換
	//=======================================================================
	jQuery.fn.scrlbarPosToPx = function(pos) {
		var pageLen = this.attr('pageLen');
		var minValue = parseInt(this.attr('minValue'));
		var maxValue = parseInt(this.attr('maxValue'));
		var pxViewportLen = this.attr('pxViewportLen');
		var px;
		if(maxValue < minValue) {
			var valueLen = minValue - maxValue;
			var pxContentLen = Math.floor(pxViewportLen * valueLen / pageLen);
			px = Math.floor(pxContentLen * ((minValue - pos) / valueLen));
		} else {
			var valueLen = maxValue - minValue;
			var pxContentLen = Math.floor(pxViewportLen * valueLen / pageLen);
			px = Math.floor(pxContentLen * ((pos - minValue) / valueLen));
		}
		return px;
	}
	//=======================================================================
	//スクロールバークラス
	//=======================================================================
	jQuery.scrlbar = function(element, option) {
		
		//===================================================================
		//オプションの既定値を設定
		//===================================================================
		option = jQuery.extend({
			dir:"h",		//スクロールバーの方向を指定
							//"h":水平スクロールバー、"v":垂直スクロールバー
			minValue:0,		//つまみの論理下限値
			maxValue:100,	//つまみの論理上限値
			pageLen:10		//論理ページ長（つまみの大きさに関連する）
		}, option);
		
		//二次的な既定値を設定
		option = jQuery.extend({
			value:option.minValue		//つまみの論理位置(デフォルトは下限値)
		}, option);

		//===================================================================
		//
		//スクロールバーは入れ子にした二つのDIV。
		//外側のDIVより内側の方が大きいと自動的にスクロールバーが表示されることを利用。
		//
		//===================================================================

		//===================================================================
		//外側のDIVの設定。念のためクラスを設定する
		//===================================================================
		var jqobj = jQuery(element);
		jqobj.addClass('scrlbar').addClass('scrlFrame');
		jqobj.css('overflow', 'scroll')
		
		//===================================================================
		//外側のDIVのスタイル設定。水平か垂直かで指定する項目が違う。
		//===================================================================
		var pxViewportLen = 0;
		switch(option.dir) {
		case "h"://水平スクロールバー
			
			//===============================================================
			//外側DIVの幅をオプションから取り出す
			//===============================================================
			option = jQuery.extend({ width:100 }, option);
			pxViewportLen = option.width;
			
			//===============================================================
			//外側DIVのスタイル指定
			//===============================================================
			jqobj
				.css('width', pxViewportLen + 'px')		//幅
				.css('height', '20px')			//高さ（固定）
				.css('overflow-x', 'scroll')	//IE用：水平方向へスクロールする
				.css('overflow-y', 'hidden');	//IE用：垂直方向へスクロールしない
												//（垂直方向の矢印ボタンを表示させない）
			break;
			
		case "v"://垂直スクロールバー
			
			//===============================================================
			//外側DIVの高さをオプションから取り出す
			//===============================================================
			height = jQuery.extend({ height:100 }, option);
			pxViewportLen = option.height;
			
			//===============================================================
			//外側DIVのスタイル指定
			//===============================================================
			jqobj
				.css('width', '20px')			//幅（固定）
				.css('height', pxViewportLen + 'px')	//高さ
				.css('overflow-x', 'hidden')	//IE用：水平方向へスクロールしない
												//（垂直方向の矢印ボタンを表示させない）
				.css('overflow-y', 'scroll');	//IE用：垂直方向へスクロールする
			break;
		}
		
		jqobj
		.attr('dir', option.dir)
		.attr('minValue', option.minValue)
		.attr('maxValue', option.maxValue)
		.attr('pageLen', option.pageLen)
		.attr('pxViewportLen', pxViewportLen)
		
		//===================================================================
		//内部のDIVを生成してクラスを設定
		//===================================================================
		var scrlContent = jQuery('<div/>').addClass('scrlContent');
		
		//===================================================================
		//内側DIVの論理的大きさを計算
		//===================================================================
		var valueLen = 0;
		if(option.maxValue < option.minValue) {
			valueLen = option.minValue - option.maxValue;
		} else {
			valueLen = option.maxValue - option.minValue;
		}
		var wholeLen = valueLen + option.pageLen;
		
		//===================================================================
		//内側DIVのピクセル単位の大きさを計算
		//===================================================================
		var pxRange = Math.floor(
				pxViewportLen * (wholeLen / option.pageLen));
		
		//===================================================================
		//内側DIVのサイズを設定
		//===================================================================
		switch(option.dir) {
		case "h"://水平スクロールバー
			scrlContent.css('width', pxRange + 'px').css('height', '20px');
			break;
		case "v"://垂直スクロールバー
			scrlContent.css('width', '20px').css('height', pxRange + 'px');
			break;
		}
		
		//===================================================================
		//内側DIVを外側DIVの内部に追加
		//===================================================================
		jqobj.empty().append(scrlContent);
		
	};
});
