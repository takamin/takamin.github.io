/**
 * 値を時間内になだらかに変化させハンドラを呼び出す。
 * 呼び出し回数は状況によって変化する。
 * 
 * @param sValue	開始値
 * @param eValue	最終値
 * @param duration	実行時間
 * @param onValueChange	値の変更ハンドラ
 * @param onComplete	終了ハンドラ
 */
function easing(sValue, eValue, duration, onValueChange, onComplete) {
	var t0 = (new Date()).getTime();	//開始時刻（ミリ秒単位）
	var T = duration;					//実行時間（ミリ秒単位）
	
	//インターバルタイマの開始
	var tid = window.setInterval(function() {
		
		//現在までの経過時間（ミリ秒単位）
		var t = (new Date()).getTime() - t0;
		
		//経過時間から現在値の算出
		var value = (eValue - sValue) * t / T + sValue;
		
		//実行時間が過ぎているなら値は終了時の値とする。
		if(t >= T) {
			value = eValue;
		}
		
		//値の変更ハンドラを呼び出す
		onValueChange.call(null, value);
		
		//終了判定
		if(t >= T) {
			
			//インターバルタイマのキャンセル
			window.clearInterval(tid);
			
			//完了時の処理を呼び出す（指定されていれば）
			if(onComplete) {
				onComplete.call(null, eValue);		
			} else {
				//値の変更ハンドラを呼び出す
				onValueChange.call(null, value);
			}
		}
		
	}, 1);//1ms間隔で実行
}
