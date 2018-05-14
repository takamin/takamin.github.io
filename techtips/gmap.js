$(function() { (new GoogleElevationMapApp()).create(); });
function GoogleElevationMapApp() {}
GoogleElevationMapApp.prototype = new AppFramework();
GoogleElevationMapApp.prototype.create = function() {
	AppFramework.prototype.create.call(this);

    //分解能のラジオボタンを無効化
    //ElevationAPIの発行数を抑えて課金を回避するため
    //分解能を25×25に固定したため。
    //月間$200までは無料だが、2018年5月現在過去3か月で上限を
    //超えていた可能性があるとの事。
    $("input[name='rbResolution'").prop("disabled", true);

	this.resetColorMap();
	
    var THIS = this;
	/**
	 * excanvas.jsとjqueryを併用している場合、
	 * $(window).load(function(){...}) でcanvasに関する処理を行う。
	 * $(function(){...})では早すぎて、excanvasが初期化されていない。
	 */
	$(window).load(function(){
		THIS.drawColorMap();
	});
	
    //初期表示オプション(デフォルト)
    var myOptions = {
      zoom: 8,
      center: new google.maps.LatLng(35, 135),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    //地図要素(DIV)
    var map_canvas = document.getElementById("map_canvas");
    
    //ウィンドウサイズ変更時のために地図の初期アスペクト比を保存する
	var map_initial_style = map_canvas.getComputedStyle();
    var map_initial_width = parseInt(map_initial_style.width);
    var map_initial_height = parseInt(map_initial_style.height);
    var map_aspect_hpw = map_initial_height / map_initial_width;
    
    //Googleマップ生成
    this.map = new google.maps.Map(map_canvas, myOptions);
    this.setMapPropFromCookie();
    
	//地図の移動、ズーム変更、地図タイプの変更イベント
    google.maps.event.addListener(this.map, "center_changed",
    		function() { THIS.onMapPropChanged();});
    google.maps.event.addListener(this.map, "maptypeid_changed",
    		function() { THIS.onMapPropChanged();});
    google.maps.event.addListener(this.map, "zoom_changed",
    		function() { THIS.onMapPropChanged();});
    
	//マウスポインタのホバーで高度情報を取得して表示する
    google.maps.event.addListener(this.map, "mousemove",
    		function(mouseEvent) {
    			THIS.onMapMouseMove(mouseEvent);});
    
    //標高データのローダー
    this.elevationLoader = new GmapElevationLoader();
    
    //標高を表す矩形の配列をクリア
	this.elevationRectangles = [];
	this.heatmap = null;
	this.heatmapDataArray = [];
	
	var commandPanelWidth = parseInt($("#commandPanel").get(0).getEffectiveWidth());
	var elevationColorBarWidth = parseInt($("#elevationColorBar").get(0).getEffectiveWidth());
	
	//ウィンドウサイズ変更時に地図のサイズを変更
    //（高さを幅に合致させて正方形とする）
    //地図の中心とアスペクト比は保持する
    addOnResize(function() {
    	doLater( function(){
        	//中心緯度経度取得
        	var latLngCenter = THIS.map.getCenter();
        	
        	//幅を取得して高さを決定する
        	var appFormWidth = parseInt($("#appForm").get(0).getEffectiveWidth());
        	var width = appFormWidth - commandPanelWidth;
        	$("#mapContainer").css('width', width + 'px');
        	
        	var height = width * map_aspect_hpw;
        	$(map_canvas).css('height', Math.floor(height));
        	$("#elevationColorBar").css('width', elevationColorBarWidth);
        	$("#elevationColorBar").css('height', Math.floor(height));
        	$("#sbvHiPass").scrlbarViewport(Math.floor(height));
        	$("#sbvLoPass").scrlbarViewport(Math.floor(height));
        	
        	google.maps.event.trigger(THIS.map, "resize");
        	
        	//中心緯度経度設定
        	THIS.map.setCenter(latLngCenter);
    	}, 100);
    });
    return this;
}
GoogleElevationMapApp.prototype.resetColorMap = function() {
	this.colorMaps = new ColorMaps();
	this.colorMaps.setMap(
			[
	          	    [-10000,	"#000000"],
	        		[  -200,	"#006688"],
	        		[     0,	"#ffff88"],
	        		[    10,	"#ccff00"],
	        		[   300,	"#668800"],
	        		[  3000,	"#002200"],
	        		[  6000,	"#ffff00"],
	        		[  8000,	"#ff0000"],
	        		[  9000,	"#ffffff"],
	        ]);
    this.maxElevation = 9000;

}
GoogleElevationMapApp.prototype.drawColorMap = function() {
	var THIS = this;
	
	//標高の色サンプルをcanvasに描く
	var canvas = document.getElementById('elevationColorBar');
	if(canvas.getContext) {
		var ctx = canvas.getContext('2d');
		var elevationColorBar = $(canvas);
		var width = parseInt(canvas.getComputedStyle().width);
		var height = parseInt(canvas.getComputedStyle().height);
		var min = -10000;
		var max = this.maxElevation;
		var minMaxDiff = max - min;
		for(var y = 0; y < height; y++) {
		    ctx.beginPath();
			ctx.strokeStyle = this.colorMaps.getCssColor(minMaxDiff * (height - y - 1) / height + min);
		    ctx.lineWidth = 2;
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
		    ctx.stroke();
		}
	}
	$("#sbvHiPass")
	.scrlbar({dir:'v',height:480,minValue:this.maxElevation, maxValue:-10000,pageLen:100})//;
	.scrlbarPos(-10000).scroll(function() {
		var elevMax =  $("#sbvLoPass").scrlbarPos();
		var elevMin =  $("#sbvHiPass").scrlbarPos();
		if(elevMax < elevMin + 100) {
			$("#sbvLoPass").scrlbarPos(elevMin + 100);
		}
		$("#txtElevationRangeMin").val(elevMin);
		$("#txtElevationRangeMax").val(elevMax);
		THIS.updateElevationColorMap();
	});
	$("#sbvLoPass").scrlbar({dir:'v',height:480,minValue:this.maxElevation, maxValue:-10000,pageLen:100})
	.scrlbarPos(this.maxElevation).scroll(function() {
		var elevMax =  $("#sbvLoPass").scrlbarPos();
		var elevMin =  $("#sbvHiPass").scrlbarPos();
		if(elevMin > elevMax - 100) {
			$("#sbvHiPass").scrlbarPos(elevMax - 100);
		}
		$("#txtElevationRangeMin").val(elevMin);
		$("#txtElevationRangeMax").val(elevMax);
		THIS.updateElevationColorMap();
	});

	$("#sbhOpacity").scrlbar({dir:'h',width:75,minValue:100,maxValue:1000,pageLen:100})
	.scrlbarPos(450).scroll(function(){
		$("#txtOpacity").val(parseFloat($("#sbhOpacity").scrlbarPos()) / 1000);
		THIS.updateElevationColorMap();
	});

}
/**
 * 標高カラーマップの表示を更新する。
 * @param elevMin 表示する標高の下限値
 * @param elevMax 表示する標高の上限値
 */
GoogleElevationMapApp.prototype.updateElevationColorMap = function () {
	var THIS = this;
	doLater(function() {
		var elevMax = $("#sbvLoPass").scrlbarPos();
		var elevMin = $("#sbvHiPass").scrlbarPos();
		$.each(THIS.elevationRectangles, function(i, result) {
			if(elevMin <= result.elevation && result.elevation <= elevMax) {
				if(!result.rect.getVisible()) {
					result.rect.setVisible(true);
				}
			} else {
				if(result.rect.getVisible()) {
					result.rect.setVisible(false);
				}
			}
			var opacity = parseFloat($("#sbhOpacity").scrlbarPos()) / 1000;
			result.rect.setOptions({fillOpacity:opacity});
		});
	},100);
}
/**
 * 標高カラーマップの表示を更新する。
 * @param elevMin 表示する標高の下限値
 * @param elevMax 表示する標高の上限値
 */
GoogleElevationMapApp.prototype.updateElevationColor = function () {
	var THIS = this;
	$.each(THIS.elevationRectangles, function(i, result) {
		result.rect.setOptions({fillColor:THIS.colorMaps.getCssColor(result.elevation)});
	});
}

/**
 * 地図の移動、ズーム変更、地図タイプの変更をセッションクッキーから復元
 */
GoogleElevationMapApp.prototype.setMapPropFromCookie = function () {
	var cookie = new COOKIE();
	if(cookie.exists('gmapCLat') && cookie.exists('gmapCLng')) {
		try{
			this.map.setCenter(new google.maps.LatLng(
					cookie.get('gmapCLat'),
					cookie.get('gmapCLng')));
		}catch(e) {
			console.error(e);
		}
	} 
	if(cookie.exists('gmapZoom')) {
		try{
			var zoom = cookie.get('gmapZoom');
			this.map.setZoom(parseInt(zoom));
		}catch(e) {
			console.error(e);
		}
	}
	if(cookie.exists('gmapTypeId')) {
		try{
			this.map.setMapTypeId(cookie.get('gmapTypeId'));
		}catch(e) {
			console.error(e);
		}
	}
}

/**
 * 地図の移動、ズーム変更、地図タイプの変更をセッションクッキーに保存
 */
GoogleElevationMapApp.prototype.onMapPropChanged = function() {
	var cookie = new COOKIE();
	var center = this.map.getCenter();
	
	//クッキーの有効期限1年後
	var dtExpires = new Date();
	dtExpires.setTime(
			dtExpires.getTime() +
			365 * 24 * 60 * 60 * 1000);
	var expires = dtExpires.toGMTString();
	
	cookie.set('gmapCLat', center.lat(), expires);
	cookie.set('gmapCLng', center.lng(), expires);
	cookie.set('gmapTypeId', this.map.getMapTypeId(), expires);
	cookie.set('gmapZoom', this.map.getZoom(), expires);
}


/**
 * 地図上でのマウスの移動
 */
GoogleElevationMapApp.prototype.onMapMouseMove = function(mouseEvent) {
	var THIS = this;
	
	//マウスポインタの座標
	var latLng = mouseEvent.latLng;
	
	//マウス位置の標高を取得
	doLater(function(){
		THIS.elevationLoader.get([latLng],
				function(elevationResultArray, elevationStatus){
					$.each(elevationResultArray,
						function(i, elevationResult) {
							THIS.showLatLngElevation(
									latLng,
									elevationResult.elevation);
					});
				});
		}, 50);
}

/**
 * 表示している地図上に標高マップを作成する
 */
GoogleElevationMapApp.prototype.btnDrawElevationColorMap_click = function() {
	var THIS = this;
	
	$('.blockOnExecute').attr('disabled', true);
	$('.enableDataExists').attr('disabled', true);
	$(".disableExistsHeatmap").attr('disabled', true);
	$(".enableExistsHeatmap").attr('disabled', true);
	
	//既にあるマップをクリア。
	this.clearElevationColorMap();
	//ヒートマップをクリア
	this.clearHeatmap();
	this.heatmapDataArray = [];
	
	var bounds = this.map.getBounds();	//表示している領域を取得
	var ne = bounds.getNorthEast();	//領域の北東端
	var sw = bounds.getSouthWest();	//領域の南西端
	var minLat = sw.lat();//地図左下の緯度
	var minLng = sw.lng();//地図左下の経度
	
	//縦（緯度）方向の分割数
	var GMAP_AREA_DIV_COUNT_LAT = parseInt($("input[name=rbResolution]:checked").val());
	//横（経度）方向の分割数
	var GMAP_AREA_DIV_COUNT_LNG = parseInt($("input[name=rbResolution]:checked").val());
	//区画の高さ（緯度）
	var dLat = (ne.lat() - minLat) / GMAP_AREA_DIV_COUNT_LAT;
	//区画の幅（経度）
	var dLng = (ne.lng() - minLng) / GMAP_AREA_DIV_COUNT_LNG;
	//標高取得リクエストの数
	var nReqLocationCount = GMAP_AREA_DIV_COUNT_LAT * GMAP_AREA_DIV_COUNT_LNG;
	//最大標高をリセット
	THIS.maxElevation = 0;
	for(var y = 0; y < GMAP_AREA_DIV_COUNT_LAT; y++) {
		
		//標高を取得する緯度
		var lat = minLat + dLat * y + dLat / 2;
		
		//横方向に標高情報を取得する。
		this.elevationLoader.getElevationAlongPath({
			path:[new google.maps.LatLng(lat, sw.lng() + dLng / 2),
		          new google.maps.LatLng(lat, ne.lng() - dLng / 2)],
		    samples:GMAP_AREA_DIV_COUNT_LNG
		    }, 
    		function(elevationResultArray, elevationStatus) {
				$.each(elevationResultArray, function(i, elevationResult) {
					var heatmapElevation = elevationResult.elevation;
					if(heatmapElevation < 0) {heatmapElevation = 0;}
					THIS.heatmapDataArray.push({
						location: elevationResult.location,
						weight: heatmapElevation
					});
					elevationResult.location = new google.maps.LatLng(
						Math.round((elevationResult.location.lat() - dLat / 2 - minLat) / dLat) * dLat + dLat / 2 + minLat,
						Math.round((elevationResult.location.lng() - dLng / 2 - minLng) / dLng) * dLng + dLng / 2 + minLng);
					var rect = THIS.drawElevation(elevationResult, dLat, dLng);
					//最大標高を更新
					if(elevationResult.elevation > THIS.maxElevation) {
						THIS.maxElevation = elevationResult.elevation;
					}
					elevationResult.rect = rect;
					THIS.elevationRectangles.push(elevationResult);
				});
    		});
	}
	waitCondition(
			function() {return (THIS.elevationRectangles.length == nReqLocationCount);},
			function() {
				$('.blockOnExecute').attr('disabled', false);
				$('.enableDataExists').attr('disabled', THIS.elevationRectangles.length <= 0);
				$(".disableExistsHeatmap").attr('disabled', THIS.heatmap != null || THIS.heatmapDataArray.length <= 0);
				$(".enableExistsHeatmap").attr('disabled',  THIS.heatmap == null);
				THIS.colorMaps.adjustMaxElevation(THIS.maxElevation);
				THIS.drawColorMap();
				THIS.updateElevationColor();
			}, 300000,
			function() {
				$('.blockOnExecute').attr('disabled', false);
				$('.enableDataExists').attr('disabled', THIS.elevationRectangles.length <= 0);
				$(".disableExistsHeatmap").attr('disabled', THIS.heatmap != null || THIS.heatmapDataArray.length <= 0);
				$(".enableExistsHeatmap").attr('disabled',  THIS.heatmap == null);
			}, 200);
}
function waitCondition(fCondition, onComplete, msTimeout, onTimeout, msInterval) {
	var dtStart = new Date();
	msTimeout = msTimeout || 180000;
	onTimeout = onTimeout || function() {};
	msInterval = msInterval || 100;
	var tidWaitCondition = window.setInterval(function () {
		var dtNow = new Date();
		if(dtNow.getTime() - dtStart.getTime() > msTimeout) {
			window.clearInterval(tidWaitCondition);
			onTimeout.call(null);
		} else if(fCondition.call(null) == true) {
			window.clearInterval(tidWaitCondition);
			onComplete.call(null);
		}
	}, msInterval);
}

/**
 * 標高マップをクリアする
 */
GoogleElevationMapApp.prototype.btnClearElevationColorMap_click = function() {
	this.clearElevationColorMap();
	$('.enableDataExists').attr('disabled', true);
	$(".disableExistsHeatmap").attr('disabled',
			this.heatmap != null || this.heatmapDataArray.length <= 0);
	$(".enableExistsHeatmap").attr('disabled',  this.heatmap == null);
}

/**
 * 標高マップをクリアする
 */
GoogleElevationMapApp.prototype.clearElevationColorMap = function() {
	$.each(this.elevationRectangles, function(i, result) {
		result.rect.setMap(null);
	});
	this.elevationRectangles = [];
	this.resetColorMap();
	this.drawColorMap();
}

GoogleElevationMapApp.prototype.btnCreateHeatmap_click = function() {
	var THIS = this;
	this.clearHeatmap();
	this.heatmap = new google.maps.visualization.HeatmapLayer({
		map:THIS.map,
		dissipating:true
	});
	this.heatmap.setData(this.heatmapDataArray);
	$(".disableExistsHeatmap").attr('disabled',
			this.heatmap != null || this.heatmapDataArray.length <= 0);
	$(".enableExistsHeatmap").attr('disabled',  this.heatmap == null);
}
GoogleElevationMapApp.prototype.btnClearHeatmap_click = function() {
	this.clearHeatmap();
	$(".disableExistsHeatmap").attr('disabled',
			this.heatmap != null || this.heatmapDataArray.length <= 0);
	$(".enableExistsHeatmap").attr('disabled',  this.heatmap == null);
}
GoogleElevationMapApp.prototype.clearHeatmap = function () {
	if(this.heatmap != null) {
		this.heatmap.setMap(null);
	}
	this.heatmap = null;
}
/**
 * 標高を描く
 * @param elevationResult	標高情報取得結果
 * @param dLat	領域の高さ（緯度）
 * @param dLng	領域の幅（経度）
 */
GoogleElevationMapApp.prototype.drawElevation =
function (elevationResult, dLat, dLng)
{
	//位置座標
	var loc = elevationResult.location;
	
	//標高
	var elevation = elevationResult.elevation;
	
	var latC = loc.lat();
	var lngC = loc.lng();
	var hLat = dLat / 2;
	var hLng = dLng / 2;
	var latSw = latC - hLat;
	var lngSw = lngC - hLng;
	var latNe = latC + hLat;
	var lngNe = lngC + hLng;
	if(lngSw > lngNe) {
		var tmp = lngSw;
		lngSw = lngNe;
		lngNe = tmp;
	}
	//領域の南西端の座標
	var latLngSouthWest = new google.maps.LatLng(latSw, lngSw);
	
	//領域の北東端の座標
	var latLngNorthEast = new google.maps.LatLng(latNe, lngNe);
	
	//矩形領域
	var rectBounds = new google.maps.LatLngBounds(
			latLngSouthWest,latLngNorthEast);

	var rect = this.drawElevationByBounds(rectBounds, elevation);
	
	return rect;
}

GoogleElevationMapApp.prototype.drawElevationByBounds =
function(rectBounds, elevation)
{
	var THIS = this;
	var opacity = parseFloat($("#sbhOpacity").scrlbarPos()) / 1000;
	
	//領域を覆う矩形を生成
	var rect = new google.maps.Rectangle({
		bounds: 		rectBounds,
		fillColor:		THIS.colorMaps.getCssColor(elevation),
		fillOpacity:	opacity,
		strokeWeight:	0
	});
	var elevMax =  $("#sbvLoPass").scrlbarPos();
	var elevMin =  $("#sbvHiPass").scrlbarPos();
	if(elevMin <= elevation && elevation <= elevMax) {
		rect.setMap(this.map);
		rect.setVisible(true);
	} else {
		rect.setMap(this.map);
		rect.setVisible(false);
	}
	
	//マウス位置の標高を表示する
    google.maps.event.addListener(rect, "mousemove",
    		function() {
    			THIS.showLatLngElevation(
    					rectBounds.getCenter(),
    					elevation);
    		}
    );
    rect.elevation = elevation;
	return rect;
}

/**
 * 位置座標と標高を表示する
 * @param latLng	位置座標
 * @param elevation 標高
 */
GoogleElevationMapApp.prototype.showLatLngElevation =
function (latLng, elevation)
{
	$('#mouseLat').text(latLng.lat().round(-4));
	$('#mouseLng').text(latLng.lng().round(-4));
	$('#mouseElv').text(elevation.round(-2));
}
