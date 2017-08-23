/**
 * 後でやる。一回だけやる。
 * やる前に何回言われても一回だけ。
 * 
 * @param job 後で実行する処理(関数)
 * @param tmo 実行待ち時間
 * @return なし
 * @author K.Takami
 * @version 2012-01-24
 */
function doLater(job, tmo) {
	//タイムアウト登録されているならキャンセル
	if(job in doLater.TID) {
		window.clearTimeout(doLater.TID[job]);
	}
	//タイムアウト登録する
	doLater.TID[job] = window.setTimeout(
			function() {
				//実行前にタイマーIDをクリア
				delete doLater.TID[job];
				//登録処理を実行
				try {
					job.call();
				} catch(e) {
					alert("EXCEPTION CAUGHT : " + job);
				}
		}, tmo);
}

//処理からタイマーIDへのハッシュ
doLater.TID = {};
