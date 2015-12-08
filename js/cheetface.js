<?= $jquery ?>
<?= $jqueryUI ?>
function startCheetSheet() {
	var setContextMessage = function() {
		var status = false;
		if(targetObj == null || targetObj.length == 0) {
			jQuery('#messagePanel').text('顔文字をコピーして貼り付けてください(先に入力エリアを選択しているとクリックで貼り付けられますよ)');
		} else if(document.URL.match(/twitter\.com/) && (targetObj.attr('value') == '' || targetObj.attr('value') == 'ツイートする...')) {
			jQuery('#messagePanel').text('Twitterでは何か入力してから顔文字をクリックするか、コピーして貼り付けてください。不便でスミマセン');
			targetObj.focus();
		} else {
			jQuery('#messagePanel').text('クリックすれば顔文字を入力できます（多分）。コピーして貼り付けてもOK');
			status = true;
		}
		return status;
	}
	var targetObj = jQuery('textarea:focus,input[type=text]:focus');
	if((targetObj != null && targetObj.length != 0) && (document.URL.match(/twitter\.com/)
		&& (targetObj.attr('value') == '' || targetObj.attr('value') == 'ツイートする...')))
	{
		alert("顔文字チートシート<br/>(*ﾟ▽ﾟ)ﾉ takamints ＼(＾▽＾)／\r\nゴメンなさい。Twitterで入力エリアが空でカーソルが表示されているときに顔文字チートシートを表示するとブラウザが異常終了してしまうことがあります。念のため、入力エリア以外をクリックしてからやり直してください。ご不便おかけしてスミマセン。m( _ _ )m");
		return;
	}
	var onTextFocus = function (event) {
		event.stopPropagation();
		targetObj = jQuery(this);
		setContextMessage();
	}
	var stopCheetSheet = function() {
		jQuery('#cheetsheet').remove();
		jQuery('textarea,input[type=text]').unbind('focus', onTextFocus);
		var s = document.getElementById('openfaces');
		s.parentNode.removeChild(s);
	}
	var selectTab = function (i) {
		jQuery('.panel.category.content').hide();
		jQuery('.button.tab').removeClass('selected');
		jQuery('#cheetsheet_btnCate' + i).addClass('selected');
		jQuery('#panelCate' + i).show();
	}
	jQuery('textarea,input[type=text]').bind('focus', onTextFocus);
	if(jQuery('#cheetsheet').length > 0) {
		stopCheetSheet(jQuery);
		return;
	}
	jQuery.fn.extend({
		insertAtCaret: function(insstr) {
			var textarea = this.get(0);
			textarea.focus();
			if (jQuery.browser.msie) {
				var range = document.selection.createRange();
				range.text = insstr;
				range.select();
			} else {
				var value = textarea.value;
				var cp = textarea.selectionStart;
				var nextcp = cp + insstr.length;
				textarea.value = value.substr(0, cp) + insstr + value.substr(cp);
				textarea.setSelectionRange(nextcp, nextcp);
			}
		}
	});
	var cheetsheet_wnd = jQuery('<div/>')
		.attr('id', 'cheetsheet').addClass('cheetsheet');
	var buttonPanel = jQuery('<div/>').attr('id','cheetsheet_buttonPanel');
	var btnClose = jQuery('<div/>')
		.attr('id', 'cheetsheet_btnClose')
		.addClass('button close').text('×')
		.click(function(event){
			event.stopPropagation();
			stopCheetSheet(jQuery);
		});
	var contentPanel = jQuery('<div/>').attr('id','cheetsheet_content');
	jQuery.each(faces, function(i, def) {
		var btn = jQuery('<div/>').attr('id', 'cheetsheet_btnCate' + i)
			.addClass('button tab').text(def.category)
			.click(function(event){
				event.stopPropagation();
				selectTab(i);
			});
		buttonPanel.append(btn);
		var panel = jQuery('<div/>').attr('id','panelCate' + i).addClass('panel category content');
		jQuery.each(def.entry, function(i, face) {
			panel.append(
				jQuery('<div/>').addClass('faceItem')
				.click(function(event){
					event.stopPropagation();
					if(setContextMessage()) {
						if(targetObj.get(0).tagName == 'INPUT') {
							targetObj.attr('value',targetObj.attr('value') + face);
						} else {
							targetObj.insertAtCaret(face);
						}
					}
				}).text(face)
			);
		});
		panel.append(jQuery('<br clear="all"/>'));
		contentPanel.append(panel);
	});
	var msgPanel = jQuery('<div/>').attr('id','messagePanel');
	cheetsheet_wnd
		.append(buttonPanel.append(btnClose).append(jQuery('<br clear="all"/>')))
		.append(contentPanel).append(msgPanel)
		.append(jQuery('<div/>').addClass('linktohome').append(
				jQuery('<a/>')
				.attr('target', '_blank')
				.attr('href', '<?=get_url_prefix()?>/takamints/index.php/bookmarklet/face')
				.html('顔文字チートシート<br/>(*ﾟ▽ﾟ)ﾉ <?=$authorizedByTwitter?'[t]':'t'?>akamints ＼(＾▽＾)／')));
	var zIndex = 500;//facebookが400のウィンドウを出すので初期値500からにする。
	jQuery('*').each(function(){
		var e = jQuery(this);
		if(e.css('position') != 'static') {
			if(e.css('z-index') != 'auto' && (zIndex == 'auto' || e.css('z-index') > zIndex)) {
				zIndex = e.css('z-index');
			}
		}
	});
	cheetsheet_wnd.css('z-index', zIndex + 1);
	jQuery('body').append(cheetsheet_wnd);
	cheetsheet_wnd.css('position', 'fixed').css('left', 10).css('top', 10);
	cheetsheet_wnd.draggable({cancel:'.faceItem'});
	selectTab(0);
	setContextMessage();
}
var faces = [
{category:'笑',entry:[
'(^^)',
'(^_^)',
'(o^∇^o)ﾉ',
'(^○^)',
'(*ﾟ▽ﾟ)ﾉ',
'(＾▽＾)/',
'＼(＾▽＾)／',
'(*´∇｀*)',
'♪(*￣ー￣)ｖ',
'(*￣∇￣*)',
'o(*^▽^*)o',
"(*'-'*)",
"('-'*)",
]},
{category:'汗',entry:[
'(^^;',
'(;^_^A',
'(ﾟｰﾟ;A',
'＼(;ﾟ∇ﾟ)/',
'(-。－；)',
'(^▽^;)',
'(・・；)',
'(￣Д￣；；',
'∑（;￣□￣',
'(＞▽＜；',
'(〃ﾟдﾟ；A',
'(￣_￣ i)ﾀﾗｰ',
'σ(^_^;)ｱｾｱｾ...',
'･･･(ﾟ＿ﾟi)ﾀﾗｰ･･･',
'(￣ー￣；'
]},
{category:'怒',entry:[
'(￣⊿￣)o"',
'ﾍ(｡≧O≦)ﾉ',
'(≧ヘ≦)',
'(・ε・)',
'(*･ε･*)',
'）￣ε￣（',
'(--)ﾑ!',
'(￣∩￣#',
'(((￣へ￣井)',
'(＃￣З￣)',
'(￣Σ￣;)ﾌﾞｰ',
'(≧ヘ≦　)',
'_s(・｀ヘ´・;)ゞ..',
'o(￣^￣o)',
'(-"-;)',
'ι(｀ﾛ´)ノ',
'(▼へ▼ﾒ)',
'(▼皿▼ﾒ)ﾉ',
'"o(￣▽￣ﾒ )',
'"o(￣ﾍ￣;)'
]},
{category:'泣',entry:[
'(ﾉ_･｡)',
'(ﾉ△･｡)',
'(ﾉ_･､)',
'(ＴｍＴ)',
'(ﾉω･､)',
'(´＿｀｡)',
'(--,)',
'o(；△；)o',
'(:_;)',
'(;д;)',
'(ρﾟ∩ﾟ)',
'p(･･,*)',
'(･･、)',
'(T△T)',
'(Ｔ＿Ｔ）',
'o(T^T)o',
'(≧д≦)',
'(T-T)',
'o(T◇T)o'
]}
];
function loadCss(href) {
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = href;
	head.appendChild(link);
}
if(typeof(takamints_cheetsheet_jquery_loaded)!='undefined') {
	startCheetSheet(jQuery);
} else {
	loadCss('<?=get_url_prefix()?>/takamints/modules/bookmarklet/css/face.css');
	startCheetSheet(jQuery);
}
takamints_cheetsheet_jquery_loaded = true;
