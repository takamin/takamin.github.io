function GmapElevationLoader() {
	this.svc = new google.maps.ElevationService();
	this.tid = null;
	this.pathRequestQueue = [];
	this.REQUEST_INTERVAL_PATH = 100;
	this.requestQueue = [];
	this.REQUEST_INTERVAL = 300;
	this.REQUEST_LOCATION_COUNT = 100;
}

/**
 * パス上の標高を取得する。
 * @param pathElevationRequest	標高を取得するパスの情報。PathElevationRequestオブジェクト
 * @param onElevationStatusOK	標高が取得できた時のハンドラー
 * 								ElevationService.getElevationAlongPathの第二引数と同様の定義
 * 								(Array.<ElevationResult>, ElevationStatus) 
 */
GmapElevationLoader.prototype.getElevationAlongPath = function(
		pathElevationRequest, onElevationStatusOK)
{
	var loader = this;
	if(pathElevationRequest) {
		loader.pathRequestQueue.push(pathElevationRequest);
	}
	if(loader.pathRequestQueue.length > 0 && loader.tid == null) {
		var errorCount = 0;		//一連の要求中に発生したエラーの数
		var skipCounter = 0;	//要求をスキップする回数
		
		//定期的に標高取得要求を投げる。
		loader.tid = window.setInterval(
				function() {
					
					//スキップカウンターが1以上の場合デクリメントして処理をスキップ
					if(skipCounter > 0) {
						skipCounter--;
						return;
					}
					//インターバルタイマー起動後に発生したエラーの回数をスキップカウンターに代入。
					skipCounter = errorCount;
					
					//要求するパス情報がまだある場合。
					if(loader.pathRequestQueue.length > 0) {
						//先頭の要求を取り出す。
						var topRequest = loader.pathRequestQueue[0];
						loader.pathRequestQueue.shift();
						loader.svc.getElevationAlongPath(
								topRequest, 
							    GmapElevationLoader.CALLBACK(
							    		//取得時のハンドラ
							    		onElevationStatusOK,
							    		//エラー時のハンドラ
							    		function(requestPath, elevationStatus) {
							    			//エラー回数をインクリメント
							    			errorCount++;
							    			//リトライする。
							    			loader.pathRequestQueue.unshift(topRequest);
							    			loader.getElevationAlongPath(
							    					null, onElevationStatusOK);
							    		},
							    		pathElevationRequest));
					}
					
					//要求が0件ならインターバルタイマーを止める
					if(loader.pathRequestQueue.length == 0) {
						window.clearInterval(loader.tid);
						loader.tid = null;
					}
					
				},
				loader.REQUEST_INTERVAL_PATH
		);
	}
}

/**
 * 座標の標高情報を取得して描画する
 * @param latLngArray
 */
GmapElevationLoader.prototype.getElevationForLocations = function(latLngArray, onElevationStatusOK) {
	var loader = this;
	this.get(latLngArray, onElevationStatusOK,
			function(request) {
				loader.getElevationForLocations(request, onElevationStatusOK);
			}
	);
}

/**
 * 複数座標の標高を得る。
 * 一回の呼び出しで複数回に分割される可能性がある。
 */
GmapElevationLoader.prototype.get = function(latLngArray, onElevationStatusOK, onOverQueryLimit) {
	var request = {
		locations:latLngArray,
		onElevationStatusOK:onElevationStatusOK,
		onOverQueryLimit:onOverQueryLimit
	};
	this.requestQueue.push(request);
	
	if(this.tid == null) {
		var loader = this;
		this.tid = window.setInterval(
				function() { loader.getSafe() },
				loader.REQUEST_INTERVAL
		);
	}
}

/**
 * 複数座標の標高情報を得る。インターバルタイマーによって呼び出される。
 * GoogleMap側のAPI制限を受けないように要求を分割する。
 */
GmapElevationLoader.prototype.getSafe = function() {
	var request = this.requestQueue[0];
	var N = this.REQUEST_LOCATION_COUNT;
	if(request.locations.length < N) {
		N = request.locations.length;
	}
	var reqLatLng = request.locations.slice(0, N);
	request.locations.splice(0, N);
	if(reqLatLng.length > 0) {
		this.getUnsafe(
				reqLatLng,
				request.onElevationStatusOK,
				request.onOverQueryLimit);
	}
	if(request.locations.length <= 0) {
		this.requestQueue.shift();
	}
	if(this.requestQueue.length <= 0) {
		window.clearInterval(this.tid);
		this.tid = null;
	} 
}

/**
 * 複数地点の標高情報を取得する
 * @param latLngArray 標高を取得する座標の配列
 * @param onElevationStatusOK 標高情報取得時のハンドラー
 * @param onOverQueryLimit 要求制限を高えた場合に呼ばれるハンドラー
 */
GmapElevationLoader.prototype.getUnsafe =
	function(latLngArray, onElevationStatusOK, onOverQueryLimit)
{
	//標高情報取得サービスで問い合わせる
	this.svc.getElevationForLocations(
			//標高情報取得要求 LocationElevationRequest
			{locations:latLngArray},
			GmapElevationLoader.CALLBACK(onElevationStatusOK, onOverQueryLimit, latLngArray));
}

GmapElevationLoader.CALLBACK = function(onElevationStatusOK, onOverQueryLimit, request) {
	return function(elevationResultArray, elevationStatus) {
			switch(elevationStatus) {
			
			//要求が不正
			case google.maps.ElevationStatus.INVALID_REQUEST:
				//console.warn('getElevationForLocations elevationStatus:INVALID_REQUEST');
				break;
				
			//要求成功
			case google.maps.ElevationStatus.OK:
				//OKハンドラを呼び出す
				onElevationStatusOK.call(
						null, 
						elevationResultArray, 
						elevationStatus);
				break;
				
			//要求の制限を超えた
			case google.maps.ElevationStatus.OVER_QUERY_LIMIT:
				//エラーハンドラーを呼び出す
				if(onOverQueryLimit != undefined) {
					onOverQueryLimit.call(null, request);
				}
				break;
				
			//要求が拒否された
			case google.maps.ElevationStatus.REQUEST_DENIED:
				//console.warn('getElevationForLocations elevationStatus:REQUEST_DENIED');
				break;
				
			//原因不明のエラー発生
			case google.maps.ElevationStatus.UNKNOWN_ERROR:
				//console.warn('getElevationForLocations elevationStatus:UNKNOWN_ERROR');
				break;
			}
		};
}
