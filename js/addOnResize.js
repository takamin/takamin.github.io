/**
 * ブラウザウィンドウリサイズイベントのデイジーチェイン
 * @param ウィンドウリサイズ時の
 */
function addOnResize(f) {
	addOnResize.handlers.push(f);
}
addOnResize.handlers = [];
if(window.onresize != undefined) {
	addOnResize(window.onresize);
}
window.onresize = function() {
	jQuery.each(
		addOnResize.handlers,
		function(i,f) {
			try{
				f.call(window);
			} catch(e) {
				alert(e + ' in ' + f);
			}
		}
	);
}
