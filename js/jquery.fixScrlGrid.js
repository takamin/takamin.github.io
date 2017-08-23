jQuery(document).ready(function($) {
	/**
	 * グリッドの生成
	 */
	$.extend({ "scrlGrid" : function(option) { return $('<div/>').scrlGrid(option); }});
	$.fn.extend({
		"fixScrlGrid" : function(options) {
			var defaultObjtions = {
					fixedColsTop: 1,
					fixedColsRight: 0,
					fixedColsBottom: 0,
					fixedColsLeft: 1,
			}
		},
		"scrlGrid" : function(option) {
			return this.each(function() {
				
				//オプションの初期値
				this.option = {
						cols:0, rows:0,
						colClasses:[],
						};
				
				//指定されたオプションの保存
				if(option) {
					jQuery.extend(this.option, option);
				}
				
				//要素にDIVを追加する。
				$(this).addClass('scrlGrid').addClass('clearfix').css('overflow', 'hidden')
					.append($('<div/>').addClass('scrlGrid_contents').css('float', 'left'));
				
				//行を追加する。
				for(var i = 0; i < this.option.rows; i++) {
					$(this).grid_addRow();
				}
			});
		},
		/**
		 * グリッドの中身を消去
		 */
		"grid_clear" :function() {
			return this.each(function() {
				$(this).children('div').empty();
			});
		},
		
		/**
		 * グリッドに行を追加
		 */
		"grid_addRow" : function(option) {
			if($.isArray(option)) {
				var colValues = option;
				return this.each(function() {
					var rowOpt = {};
					if(this.option.colClasses) {
						rowOpt.colClasses = this.option.colClasses;
					}
					if(this.option.cols) {
						rowOpt.cols = this.option.cols;
					} else {
						rowOpt.cols = colValues.length;
					}
					rowOpt.colValues = colValues;
					var row = $('<div/>').grid_row(rowOpt);
					$(this).children('div').append(row);
				});
			} else {
				var className = option;
				return this.each(function() {
					if(className) {
						this.lastAddClassName = className;
					} else if(this.lastAddClassName) {
						className = this.lastAddClassName;
					}
					
					var rowOpt = {};
					rowOpt.colClasses = this.option.colClasses;
					rowOpt.cols = this.option.cols;
					if(className) {
						rowOpt.className = className;
					}
					var row = $('<div/>').grid_row(rowOpt);
					$(this).children('div').append(row);
				});
			}
		},
		/**
		 * gridプラグインに対する操作の場合、グリッド内の行オブジェクトを選択する。
		 * この場合、optionは0始まりの行インデックス。
		 * 
		 * 操作対象がgridプラグインでない場合は、行オブジェクトgrid_rowプラグインを生成して返す。
		 */
		"grid_row" : function(option) {
			if(this.hasClass('scrlGrid')) {
				//===============================================================
				//gridプラグイン要素内の行オブジェクトを返す。
				//===============================================================

				var rowno = option + 1;//nth-child(n)を使用するため1オリジンに変換
				var $rows = null;//返却するgrid_rowオブジェクト
				
				this.each(function() {
					//指定された行を選択する。
					var $row = $(this).find('.scrlGrid_row:nth-child(' + rowno + ')');
					//返却するための行オブジェクトがnullなら設定。nullでないなら追加する。
					if($rows == null) {
						$rows = $row;
					} else {
						$rows.add($row);
					}
				});
				//選択した行オブジェクトを返却する
				return $rows;
				
			} else if(!this.hasClass('scrlGrid_row')) {
				
				//===============================================================
				//grid_rowオブジェクトを生成して返す。要素はdivである必要がある。
				// $('<div/>').grid_row({options....});
				//===============================================================

				var nCols = (option && option.cols) ? option.cols : 0;
				var colClasses = option.colClasses;
				var colValues = option.colValues;
				if(nCols == 0) {
					if(colClasses) {
						nCols = colClasses.length;
					} else if(colValues) {
						nCols = colValues.length;
					}
				}
				return this.each(function() {
					var $row = $('<div/>').addClass('clearfix').css('height', '100%');
					//カラムを追加する
					for(var i = 0; i < nCols; i++) {
						var className = '';
						var col = $('<div/>');
						if(colValues) {
							if(i < colValues.length) {
								col.html(colValues[i]);
							}
						}
						if(colClasses && i < colClasses.length) {
							col.grid_col(colClasses[i]);
						} else {
							col.grid_col();
						}
						$row.append(col);
					}
					$(this).addClass('scrlGrid_row').append($row);
					
					//行へクラスを設定
					if(option.className) {
						$(this).addClass(option.className);
					}
				});
			}
		},
		/**
		 * 列を参照
		 */
		"grid_col" : function(option) {
			if(this.hasClass('scrlGrid')) {
				var colno = option + 1;//nth-child(n)を使用するため1オリジンに変換
				var $cols = null;//返却するgrid_colオブジェクト
				this.each(function() {
					//指定された行を選択する。
					var $row = $(this).find('.scrlGrid_row');
					var $col = $row.find('.scrlGrid_col:nth-child(' + colno + ')');
					//返却するための行オブジェクトがnullなら設定。nullでないなら追加する。
					if($cols == null) {
						$cols = $col;
					} else {
						$cols.add($col);
					}
				});
				//選択した行オブジェクトを返却する
				return $cols;
			} else if(!this.hasClass('scrlGrid_col')) {
				
				//DIV.scrlGrid_colを生成する。
				
				//引数はクラス名
				var className = option;
				return this.each(function() {
					$(this).addClass('scrlGrid_col')
					.append(
							$('<div/>').addClass('scrlGrid_cell')
							.css('height', '100%')
							.css('overflow', 'hidden')
							.append($(this).contents().remove()))
					.css('height', '100%')
					.css('float', 'left')
					.css('overflow', 'hidden');
					if(className) {
						$(this).addClass(className);
					}
				});
			}
		},
		"grid_cell" : function(rowno, colno, content) {
			console.info(
					"grid_cell("
						+ "rowno=" + rowno + ", "
						+ "colno=" + colno + ", "
						+ "content=" + content
						+ ")");
			if(content !== undefined) {
				return this.each(function(){
					console.info("$(#" + this.id + ").grid_cell("
							+ rowno + ", " + colno + ", " + content + ")");
					if($(this).hasClass('scrlGrid')) {
						$(this).find('.scrlGrid_row:nth-child(' + (rowno+1) + ') '
									+'.scrlGrid_col:nth-child(' + (colno+1) + ') '
									+'.scrlGrid_cell').html(content);
					}
				});
			} else {
				var cells = null;
				this.each(function(){
					var cell = $(this)
						.find('.scrlGrid_row:nth-child(' + (rowno+1) + ')')
						.find('.scrlGrid_col:nth-child(' + (colno+1) + ')')
						.find('.scrlGrid_cell');
					if(cells == null) {
						cells = cell;
					} else {
						cells.add(cell);
					}
				});
				return cells;
			}
		},
		"grid_update" : function() {
			return this.each(function() {
				if($(this).hasClass('scrlGrid')) {
					$(this).find('.scrlGrid_row').grid_update();
				} else if($(this).hasClass('scrlGrid_row')) {
					var rowWidth = 0;
					$(this).find(".scrlGrid_col").each(function(iCol, col) {
						var cssWidth = col.getEffectiveWidth();
						if(cssWidth != '') {
							var colWidth = parseInt(col.getEffectiveWidth());
							//セルの絶対左端座標を指定
							rowWidth += colWidth;
						}
					});
					if(rowWidth) {
						$(this).children().css("width", rowWidth + 'px');
					}
				}
			});
		},
		"grid_contentWidth" : function () {
			return parseInt(this.find('.scrlGrid_row').css('width'));
		},
		"grid_contentHeight" : function () {
			return parseInt(this.children('div').css('height'));
		},
		"grid_hscrlbar": function(sb) {
			sb = this.grid_initHscrlbar(sb);
			this.grid_attachHscrlbar(sb);
			return sb;
		},
		"grid_vscrlbar": function(sb) {
			if(this.css('float') == 'none') {
				this.css('float','left');
				console.warn('[grid_vscrlbar] float指定無しのため、leftに設定しました。');
			}
			sb = this.grid_initVscrlbar(sb);
			this.grid_attachVscrlbar(sb);
			return sb;
		},
		"grid_initHscrlbar" : function(sb) {
			var contentWidth = this.grid_contentWidth();
			var viewPortWidth = parseInt(this.css('width'));
			var maxValue = contentWidth - viewPortWidth;
			if(maxValue < 0) {
				maxValue = 0;
			}
			if(!sb) {
				sb = $("<div/>");
			}
			return sb.scrlbar({
				dir:"h", width:viewPortWidth,
				minValue: 0, maxValue: maxValue,
				pageLen: viewPortWidth,
			});
		},
		"grid_initVscrlbar" : function(sb) {
			var contentHeight = this.grid_contentHeight();
			var viewPortHeight = parseInt(this.css('height'));
			var maxValue = contentHeight - viewPortHeight;
			if(maxValue < 0) {
				maxValue = 0;
			}
			if(!sb) {
				sb = $("<div/>");
			}
			return sb.css('float', 'left').scrlbar({
					dir:"v", height:viewPortHeight,
					minValue: 0, maxValue: maxValue,
					pageLen: viewPortHeight,
				});
		},
		"grid_attachHscrlbar" : function(sb) {
			return this.each(function() {
				var divGrid = this;
				sb.scroll(function(){
					$(divGrid).scrollLeft($(this).scrlbarPos());
				});
			});
		},
		"grid_attachVscrlbar" : function(sb) {
			return this.each(function() {
				var divGrid = this;
				sb.scroll(function(){
					$(divGrid).scrollTop($(this).scrlbarPos());
				});
			});
		},
	});
});
