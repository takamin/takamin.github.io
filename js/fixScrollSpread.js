/////////////////////////////////////////////////////////////////////////////
//基本クラス
/////////////////////////////////////////////////////////////////////////////
function FixScrollSpread() {}
FixScrollSpread.instanceCount = 0;
FixScrollSpread.prototype.create = function (element) {
    var THIS = this;
    
    //データテーブルのHTML要素
    this.element = element;
    
    //HTML要素にIDが設定されていない場合は自動的に設定する
    if (!this.element.id) {
        this.element.id = "FixScrollSpread-" + FixScrollSpread.instanceCount;
    }
    FixScrollSpread.instanceCount++;

    //データテーブルのjQuery要素
    this.jqobj = $(this.element);

    //サイズ情報（全体、固定行列、スクロール）
	var width = this.jqobj.attr('width');
	var height = this.jqobj.attr('height');
	width = parseInt(width);
	height = parseInt(height);
	
	var fixedWidth = this.jqobj.attr('fixedWidth');
	fixedWidth = parseInt(fixedWidth);

	var fixedHeight = this.jqobj.attr('fixedHeight');
	fixedHeight = parseInt(fixedHeight);
	
	var bottomFixedHeight = this.jqobj.attr('bottomFixedHeight');
	if(bottomFixedHeight) {
		bottomFixedHeight = parseInt(bottomFixedHeight);
	} else {
		bottomFixedHeight = 0;
	}
    var scrlWidth = this.jqobj.attr('scrlWidth');
    if(!scrlWidth) {
    	scrlWidth = width - fixedWidth;
    } else {
    	scrlWidth = parseInt(scrlWidth);
    }
    var scrlHeight = this.jqobj.attr('scrlHeight');
    if(!scrlHeight) {
    	scrlHeight = height - fixedHeight - bottomFixedHeight;
    } else {
    	scrlHeight = parseInt(scrlHeight);
    }

    /////////////////////////////////////////////////////////////////////////
    //左上の固定領域
    /////////////////////////////////////////////////////////////////////////
    var leftTopFixedContent = this.jqobj.find('.leftTopContents');
    if(leftTopFixedContent.length <= 0) {
    	leftTopFixedContent = $('<div/>').addClass('leftTopContents');
    	this.jqobj.append(leftTopFixedContent);
    }
    var leftTopFixedPane =
		$('<div/>')
		.addClass('floatPanel hfixed vfixed')
		.addClass('border1111')
		.append(leftTopFixedContent);
    
    /////////////////////////////////////////////////////////////////////////
    //上の固定行領域
    /////////////////////////////////////////////////////////////////////////
    var topFixedContent = this.jqobj.find('.topContents').addClass('scrl');
    if(topFixedContent.length <= 0) {
    	topFixedContent = $('<div/>').addClass('topContents').addClass('scrl');
    	this.jqobj.append(topFixedContent);
    }
    var topFixedPane =
		$('<div/>').addClass('floatPanel hscrl vfixed hview')
		.addClass('border1110')
		.append(topFixedContent);

    /////////////////////////////////////////////////////////////////////////
    //左の固定列領域
    /////////////////////////////////////////////////////////////////////////
    var leftFixedContent = this.jqobj.find('.leftContents').addClass('scrl');
    if(leftFixedContent.length <= 0) {
    	leftFixedContent = $('<div/>').addClass('leftContents').addClass('scrl');
    	this.jqobj.append(leftFixedContent);
    }
    var leftFixedPane =
		$('<div/>').addClass('floatPanel hfixed vscrl vview')
		.addClass('border0111')
		.append(leftFixedContent);

    /////////////////////////////////////////////////////////////////////////
    //スクロール領域
    /////////////////////////////////////////////////////////////////////////
    var scrollContent = this.jqobj.find('.scrlContents').addClass('scrl');
    if(scrollContent.length <= 0) {
    	scrollContent = $('<div/>').addClass('scrlContents').addClass('scrl');
    	this.jqobj.append(scrollContent);
    }
    var scrollPane = $('<div/>').addClass('floatPanel border0110 hview vview')
		.append($('<div/>').addClass('hscrl vscrl').css('overflow', 'hidden')
        .scroll(function () { FixScrollSpread.onScrollContent(this, THIS.element.id) })
		.append(scrollContent));

    if(bottomFixedHeight > 0) {
    	
        /////////////////////////////////////////////////////////////////////////
        //右下の固定領域
        /////////////////////////////////////////////////////////////////////////
        var leftBottomFixedContent = this.jqobj.find('.leftBottomContents');
        if(leftBottomFixedContent.length <= 0) {
        	leftBottomFixedContent = $('<div/>').addClass('leftBottomContents');
        	this.jqobj.append(leftBottomFixedContent);
        }
        var leftBottomFixedPane =
    		$('<div/>')
    		.addClass('floatPanel hfixed vfixed')
    		.addClass('border0111')
    		.append(leftBottomFixedContent);
        
        /////////////////////////////////////////////////////////////////////////
        //下の固定行領域
        /////////////////////////////////////////////////////////////////////////
        var bottomFixedContent = this.jqobj.find('.bottomContents').addClass('scrl');
        if(bottomFixedContent.length <= 0) {
        	bottomFixedContent = $('<div/>').addClass('bottomContents').addClass('scrl');
        	this.jqobj.append(bottomFixedContent);
        }
        var bottomFixedPane =
    		$('<div/>').addClass('floatPanel hscrl vfixed hview')
    		.addClass('border0110')
    		.append(bottomFixedContent);
    }
    
    /////////////////////////////////////////////////////////////////////////
    //垂直スクロールバー
    /////////////////////////////////////////////////////////////////////////
    var vScrollBar = $('<div/>').addClass('floatPanel')
    .append($('<div/>').addClass('vsb vscrl')
    .scroll(function () {$('#' + THIS.element.id + ' .vscrl').scrollTop($(this).scrollTop()); })
    .append($('<div/>').addClass('scrl').html('&nbsp;')));
    //.append($('<div class="scrl">&nbsp;</div>')));

    /////////////////////////////////////////////////////////////////////////
    //水平スクロールバー
    /////////////////////////////////////////////////////////////////////////
    var hScrollBar = $('<div/>').addClass('hsb hscrl')
        .scroll(function () { $('#' + THIS.element.id + ' .hscrl').scrollLeft($(this).scrollLeft()); })
		.append($('<div class="scrl">&nbsp;</div>'))

    var scroller = $('<div/>').addClass('floatPanel')
		.append(scrollPane)
		.append(vScrollBar).append('<br clear="all"/>');
		
	if(bottomFixedHeight <= 0) {
		scroller.append(hScrollBar);
	}
    this.jqobj.append(leftTopFixedPane).append(topFixedPane).append('<br clear="all"/>');
    this.jqobj.append(leftFixedPane).append(scroller).append('<br clear="all"/>');
    if(bottomFixedHeight > 0) {
        var scroller2 = $('<div/>').addClass('floatPanel')
		.append(bottomFixedPane).append('<br clear="all"/>')
		.append(hScrollBar);
    	this.jqobj.append(leftBottomFixedPane)
    	.append(scroller2).append('<br clear="all"/>');
    }
    
	//固定領域・スクロール領域の画面上の幅と高さを設定
    this.setFixedWidth(fixedWidth);
    this.setScrollWidth(scrlWidth);
    var contentWidth = this.jqobj.attr('contentWidth');
    this.setContentWidth(contentWidth);
    
    this.setFixedHeight(fixedHeight, bottomFixedHeight);
    this.setScrollHeight(scrlHeight);
    var contentHeight = this.jqobj.attr('contentHeight');
    this.setContentHeight(contentHeight);

    //表示状態に
    this.jqobj.css('visibility', 'visible');
    return this;
}

FixScrollSpread.onScrollContent = function(content, id) { 
	var vsb = $('#' + id + ' .vsb');
	var scrollTop = content.scrollTop;
	if (vsb.scrollTop() != scrollTop) {
	    vsb.scrollTop(scrollTop);
	}
	var hsb = $('#' + id + ' .hsb');
	var scrollLeft = content.scrollLeft;
	if (hsb.scrollLeft() != scrollLeft) {
	    hsb.scrollLeft(scrollLeft);
	}

	//スプレッドシート要素にセットされたonScrollを呼び出す
	var jqobj = $('#' + id);
	var onscroll = jqobj.attr('onScroll');
	if(onscroll) {
		if(typeof(onscroll) == 'function') {
			//Firefox
			onscroll.call();
		} else {
			//IEはこちら
			var callback = function() { eval(onscroll); };
			callback.call();
		}
	}
}

FixScrollSpread.prototype.find = function(expr) {
	return this.jqobj.find(expr);
}

FixScrollSpread.prototype.setFixedWidth = function(width) {
	if(width != null) {
		this.jqobj.find('.hfixed').css('width' , width + 'px');
	}
}

FixScrollSpread.prototype.getFixedWidth = function() {
	return parseInt(this.jqobj.find('.hfixed').css('width'));
}

FixScrollSpread.prototype.setFixedHeight = function(height) {
	if(height != null) {
		this.jqobj.find('.vfixed').css('height' , height + 'px');
	}
}

FixScrollSpread.prototype.getFixedHeight = function() {
	return parseInt(this.jqobj.find('.vfixed').css('height'));
}

FixScrollSpread.prototype.setScrollWidth = function(width) {
	if(width != null) {
		this.jqobj.find('.hscrl').css('width' , width + 'px');
	}
}

FixScrollSpread.prototype.getScrollWidth = function() {
	return parseInt(this.jqobj.find('.hscrl').css('width'));
}

FixScrollSpread.prototype.setScrollHeight = function(height) {
	if(height != null) {
		this.jqobj.find('.vscrl').css('height' , height + 'px');
	}
}

FixScrollSpread.prototype.getScrollHeight = function() {
	return parseInt(this.jqobj.find('.vscrl').css('height'));
}

FixScrollSpread.prototype.setContentWidth = function(width) {
	if(width != null) {
		this.jqobj.find('.hscrl .scrl').css('width' , width + 'px');
	}
}

FixScrollSpread.prototype.setContentHeight = function(height) {
	if(height != null) {
		this.jqobj.find('.vscrl .scrl').css('height' , height + 'px');
	}
}

FixScrollSpread.prototype.getContentWidth = function(width) {
	return parseInt(this.jqobj.find('.hscrl .scrl').css('width'));
}

FixScrollSpread.prototype.getContentHeight = function(height) {
	return parseInt(this.jqobj.find('.vscrl .scrl').css('height'));
}

/////////////////////////////////////////////////////////////////////////////
//jQuery dataTable Plug-in
/////////////////////////////////////////////////////////////////////////////
$(function() {
	$.fn.dataTable = function(option) {
		var element = this[0];
		var dataTable = new DataTable();
		dataTable.create(element, option);
	};
});

/////////////////////////////////////////////////////////////////////////////
//テーブルを読み取ってdataTableのOPTIONに変換する。
/////////////////////////////////////////////////////////////////////////////
function toDataTableOption(table) {
	var opt = {};
	var thead = table.find('thead');
	var tbody = table.find('tbody');
	var tfoot = table.find('tfoot');
	var thead_tr = thead.find('tr');
	var tbody_tr = tbody.find('tr');
	var tfoot_tr = tfoot.find('tr');

	opt.topFixedRows	=	thead_tr.size();
	opt.bottomFixedRows	=	tfoot.size();		
	opt.columns	= [];
	opt.header	= [];
	opt.columnWidth	= [];
	
	//ヘッダ行の読み取り
	var height = 0;
	var lineHeight = 0;
	thead_tr.children().each(function(i, cell) {
		//クラス名の決定
		var className = $(cell).attr('class');
		if(!className) {className = 'col' + i; }
		opt.columns.push(className);

		//列幅を保存
		var width = parseInt(cell.getComputedStyle().width);
		opt.columnWidth.push(width);
		
		//セルデータの保存
		var cellData = {};
		cellData.html = $(cell).html();
		
		//セルのスタイルを保存
		var style = cell.getComputedStyle();
		cellData.textAlign = style.textAlign;
		cellData.backgroundColor = style.backgroundColor;
		cellData.color = style.color;
		cellData.fontSize = style.fontSize;
		cellData.fontWeight = style.fontWeight;
		if(style.height != "auto") {
			if(height < parseInt(style.height)) {
				height = parseInt(style.height);
			}
		}
		if(style.lineHeight != "normal") {
			if(lineHeight < parseInt(style.lineHeight)) {
				lineHeight = parseInt(style.lineHeight);
			}
		}
		opt.header.push(cellData);
	});
	$.each(opt.header, function(i, cellData) {
		//console.info("thead cell style.height is " + height);
		if(height == 0) {
			cellData.height = "auto";
		} else {
			cellData.height = height + "px";
		}
		//console.info("thead cell style.lineHeight is " + lineHeight);
		if(lineHeight == 0) {
			cellData.lineHeight = "normal";
		} else {
			cellData.lineHeight = lineHeight + "px";
		}
	});
	
	//データ部分の読み取り
	opt.dataRows = [];
	
	//全行についての処理
	tbody_tr.each(function(iRow, tr){
		var rowData = [];
		var height = 0;
		var lineHeight = 0;
		$(tr).children().each(function(iCol, cell) {

			//列幅の更新
			var width = parseInt(cell.getComputedStyle().width);
			if(!isNaN(width)) {
				if(width > opt.columnWidth[iCol]) {
					//console.info("toDataTableOption UPDATE col[" + iCol + "] width=" + width);
					opt.columnWidth[iCol] = width;
				}
			}
			
			//セルデータの保存
			var cellData = {};
			cellData.html = $(cell).html();
			
			//セルのスタイルを保存
			var style = cell.getComputedStyle();
			//console.info("tbody style.height = " + style.height);
			//console.info("tbody style.lineHeight = " + style.lineHeight);
			cellData.textAlign = style.textAlign;
			cellData.backgroundColor = style.backgroundColor;
			cellData.color = style.color;
			cellData.fontSize = style.fontSize;
			cellData.fontWeight = style.fontWeight;
			if(style.height != "auto") {
				if(height < parseInt(style.height)) {
					height = parseInt(style.height);
				};
			}
			if(style.lineHeight != "normal") {
				if(lineHeight < parseInt(style.lineHeight)) {
					lineHeight = parseInt(style.lineHeight);
				};
			}
			rowData.push(cellData);
		});
		$.each(rowData, function(i, cellData) {
			//console.info("tbody cell style.height is " + height);
			if(height == 0) {
				cellData.height = "auto";
			} else {
				cellData.height = height + "px";
			}
			//console.info("tbody cell style.lineHeight is " + lineHeight);
			if(lineHeight == 0) {
				cellData.lineHeight = "normal";
			} else {
				cellData.lineHeight = lineHeight + "px";
			}
		});
		opt.dataRows.push(rowData);
	});
	
	//テーブルタグの幅（２５を引いているのはスクロールバーの幅）
	var table_width = parseInt(table.get(0).getComputedStyle().width);
	opt.tableWidth = table_width - 25;
	
	//列幅の合計
	var total_width = 0;
	$.each(opt.columnWidth, function(i, width) {
		total_width += width;
	});
	//テーブルの幅に収まるように各列の幅を計算し直す。（２５を引いているのはスクロールバーの幅）
	//console.info("toDataTableOption total_width=" + total_width);
	for(var i = 0; i < opt.columnWidth.length; i++) {
		//console.info("BEFORE toDataTableOption opt.columnWidth[" + i + "] width=" + opt.columnWidth[i]);
		opt.columnWidth[i] = Math.floor((table_width - 25) * opt.columnWidth[i] / total_width);
		//console.info("AFTER  toDataTableOption opt.columnWidth[" + i + "] width=" + opt.columnWidth[i]);
	}
	return opt;
}

/////////////////////////////////////////////////////////////////////////////
// class DataTable extends FixScrollSpread
/////////////////////////////////////////////////////////////////////////////
function DataTable() {}
DataTable.prototype = new FixScrollSpread();

/////////////////////////////////////////////////////////////////////////////
//データテーブルの構築
//PARAMETER
//	element データテーブル要素。divでなければならない
//	option	列の設定情報など
//		= {
//			leftFixedCols:		<左側固定列の列数>,
//			topFixedRows:		<上部固定行数>,
//			bottomFixedRows:	<下部固定行数>,
//			columns:[			//列定義の配列
//				{				//列の定義情報
//					name:		<列の表示名>,
//					className:	<列に設定されるクラス名>
//				}, ...
//			]
//		}
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.create = function(element, option) {
	if(option.tableWidth) {
		$(element).attr('width', "" + option.tableWidth);
	}
	
	//固定行の高さを得る
	if(option.header && option.header[0] && option.header[0].height) {
		$(element).attr('fixedHeight', "" + parseInt(option.header[0].height));
		//console.info('DataTable::create set fixedHeight = ' + parseInt(option.header[0].height));
	}
	
	//基本クラスの構築
	FixScrollSpread.prototype.create.call(this, element);

	this.option = option;
    
    //固定行の内容をクリア
    this.jqobj.find(".leftTopContents").empty();
	this.jqobj.find(".topContents").empty();
	this.addHeaderRow(option.header);
	if(option.dataRows) {
		this.setData(option.dataRows, option.footer);
	}
    return this;
}

DataTable.prototype.addHeaderRow = function (rowData) {
	if(!rowData) {
		rowData = {};
		$.each(this.option.columns, function(i, className) {
			rowData[className] = className;
		});
	}
	var rows = this.createRows(rowData);
	this.jqobj.find(".leftTopContents").append($(rows.get(0)));
	this.jqobj.find(".topContents").append($(rows.get(1)));
   	return rows;
}

/////////////////////////////////////////////////////////////////////////////
//データ設定
//	パラメータ
//		data:	行データの配列
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.setData = function (bodyRowDataList, footerRowData) {
	this.clearDataRows();
	this.addDataRows(bodyRowDataList);
	if(footerRowData) {
		this.setFooter(footerRowData);
	}
	this.updateSize();
}

/////////////////////////////////////////////////////////////////////////////
//エータ行のクリア
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.clearDataRows = function () {
	this.jqobj.find(".leftContents").empty();
	this.jqobj.find(".scrlContents").empty();
}

/////////////////////////////////////////////////////////////////////////////
//データ行の追加
//data:	行データの配列
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.addDataRows = function (data) {
	var THIS = this;
	$.each(data, function(i, rowData) {
		THIS.addDataRow(rowData);
	});
}

/////////////////////////////////////////////////////////////////////////////
//データ行の追加
//	パラメータ
//		rowData:	行データ：列のクラス名をキーにした表示データへのハッシュ
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.addDataRow = function (rowData) {
	var rows = this.createRows(rowData);
	this.jqobj.find(".leftContents").append($(rows.get(0)));
	this.jqobj.find(".scrlContents").append($(rows.get(1)));
   	return rows;
}

/////////////////////////////////////////////////////////////////////////////
//行の生成
//	パラメータ
//		rowData:	列のクラス名をキーにした表示データへのハッシュ
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.createRows = function(rowData) {
	var row1 = $("<div/>").addClass("fssRow");//固定カラムの行
	var row2 = $("<div/>").addClass("fssRow");//スクロールカラムの行
	var rows = $([row1.get(0),row2.get(0)]);
	var option = this.option;
	var THIS = this;
    if(option) {
		$.each(option.columns, function(i, className) {
			var col = $('<div/>')
				.addClass('col').addClass(className)
				.css('float','left')
				.append($('<div/>').addClass('cell').html('&nbsp;'));
			
			//オプションにcolumnWidthが指定されているならスタイル指定を追加する
			if(option.columnWidth
			&& $.isArray(option.columnWidth)
			&& i < option.columnWidth.length)
			{
				col.css('width', option.columnWidth[i] + 'px'); 
			}
			//行へ追加する
			if(i < option.leftFixedCols) {
				row1.append(col);
			} else {
				row2.append(col);
			}
		});
		rows.append($('<br clear="all"/>'));
    }
    if($.isArray(rowData)) {
		$.each(option.columns, function(i, className) {
			var cell = rows.find('.' + className + ' .cell');
			var data = rowData[i];
			THIS.setCellData(cell, data);
		});
    } else {
    	$.each(rowData, function(className, data) {
			var cell = rows.find('.' + className + ' .cell');
			THIS.setCellData(cell, data);
    	});
    }
	return rows;
}

DataTable.prototype.setCellData = function(cell, data) {
	if(typeof data == 'object') {
		cell.html(data.html);
		$.each(
				['textAlign',
				 'backgroundColor','color',
				 'fontSize','fontWeight',
				 'height', 'lineHeight'],
				function(i, style) {
					if(data[style]) {
						cell.css(style, data[style]);}
				});
	} else {
		cell.html(data);
	}
}

/////////////////////////////////////////////////////////////////////////////
//下部の固定行にデータを設定
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.setFooter = function(rowData) {
	var rows = this.createRows(rowData);
	$('.leftBottomContents').empty().append($(rows.get(0)));
	$('.bottomContents').empty().append($(rows.get(1)));
	
}

/////////////////////////////////////////////////////////////////////////////
//データテーブルのサイズ更新。
/////////////////////////////////////////////////////////////////////////////
DataTable.prototype.updateSize = function() {
	//固定列幅
	console.debug("DataTable.updateSize");
	var fixedWidth = 0;
	for(var i = 0; i < this.option.leftFixedCols; i++) {
		fixedWidth += this.option.columnWidth[i];
	}
	console.debug("fixedWidth = " + fixedWidth);
//	$('.leftTopContents .col').each(function(i, col) {
//		fixedWidth += parseInt(col.getComputedStyle().width);
//	});
    this.setFixedWidth(fixedWidth);
    
    //スクロール領域幅
    this.setScrollWidth(this.jqobj.attr('width') - fixedWidth);
	
    //コンテンツ列幅
    var contentWidth = 0;
	$.each(this.option.columnWidth, function(i, width) {
		//console.info("DataTable::updateSize column's width = " + width);
		contentWidth += width;
	});
	/*
	$('.topContents .col').each(function(i, col) {
		contentWidth += parseInt(col.getComputedStyle().width);
	});
	*/
	//console.info("DataTable::updateSize contentWidth = " + contentWidth);
    this.setContentWidth(contentWidth);
    
    //コンテンツ高さ
	var fixedHeight = 0;
	fixedHeight = parseInt($(this.element).attr("fixedHeight"));
	//固定行の高さを得る
//	if(this.option.header && this.option.header[0] && this.option.header[0].height) {
//		fixedHeight = parseInt(this.option.header[0].height);
//	} else {
//		console.info("DataTable::updateSize fixedHeight = " + fixedHeight);
//		$('.topContents .row').each(function(i, row) {
//			var rowStyle = row.getComputedStyle();
//			var rowHeight = parseInt(rowStyle.height);
//			$(row).find('.col').each(function(j, col) {
//				var colStyle = col.getComputedStyle();
//				var colHeight = parseInt(colStyle.height);
//				console.info("DataTable::updateSize colHeight = " + colHeight);
//				if(colHeight > fixedHeight) {
//					fixedHeight = colHeight;
//					console.info("DataTable::updateSize fixedHeight = " + colHeight);
//				}
//			});
//		});
//	}
	this.setFixedHeight(fixedHeight);
	this.jqobj.css('line-height', fixedHeight + 'px');
	$('.vfixed .fssRow, .vfixed .fssRow .cell').css('height', fixedHeight + 'px');
	
    //コンテンツ高さ
	var height = 0;
	$('.scrlContents .fssRow').each(function(i, row) {
		var rowStyle = row.getComputedStyle();
		var rowHeight = parseInt(rowStyle.height);
		height += parseInt(rowHeight);
	});
	this.setContentHeight(height);
}
