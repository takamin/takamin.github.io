#!node
var fs = require('fs'); function script(filename) { return fs.readFileSync(filename)+'';}

eval(script('unittest.js'));

//unit test for drawing.js
function DummyHTMLElement() {}
DummyHTMLElement.prototype.getComputedStyle = function() {
	return {
		"width":"640px",
		"height":"480px",
	};
}
eval(script('../drawing.js'));

var drawing = new Drawing().create(new DummyHTMLElement());
var drawing2 = new Drawing().create(new DummyHTMLElement());
test("Drawing.create", [
		match(function() {return drawing.pxWidth;},640),
		match(function() {return drawing.pxHeight;},480),
		match(function() {return drawing.scale.x;},1.0),
		match(function() {return drawing.scale.y;},1.0),
		match(function() {return drawing.clip;},null),
		
		match(function() {return drawing.strokeColor;},"#000000"),
		match(function() {return drawing.strokeWidth;},1),
		match(function() {return drawing.lineCap;},"butt"),
		match(function() {return drawing.fillColor;},"#000000"),
		match(function() {return drawing.fontFamily;},"Meiryo"),
		match(function() {return drawing.fontWeight;},"normal"),
		match(function() {return drawing.lineHeight;},20),
		match(function() {return drawing.textAlign;},"start"),
		
		not_match(function() {return drawing.savedContext; }, null),
		match(function() {return typeof(drawing.savedContext);},typeof([])),
		not_match(function() {return typeof(drawing.savedContext.length); }, undefined),
		match(function() {return drawing.savedContext.length;},0),
		]);

test("Drawing.saveContext/restoreContext", [
		 match(function() { drawing.saveContext();		return drawing.savedContext.length;},1),
		 match(function() { drawing.restoreContext();	return drawing.savedContext.length;},0),
		 match(function() { drawing.restoreContext();	return drawing.savedContext.length;},0),
		 match(function() { drawing.saveContext();		return drawing.savedContext.length;},1),
		 match(function() { drawing.saveContext();		return drawing.savedContext.length;},2),
		 match(function() { drawing.restoreContext();	return drawing.savedContext.length;},1),
		 match(function() { drawing.restoreContext();	return drawing.savedContext.length;},0),
		 match(function() { drawing.saveContext();		return drawing.savedContext.length;},1),
		 match(function() { return drawing.savedContext[0].strokeColor;},drawing.strokeColor),
		 match(function() { return drawing.savedContext[0].strokeWidth;},drawing.strokeWidth),
		 match(function() { return drawing.savedContext[0].lineCap    ;},drawing.lineCap),
		 match(function() { return drawing.savedContext[0].fillColor  ;},drawing.fillColor),
		 match(function() { return drawing.savedContext[0].fontFamily ;},drawing.fontFamily),
		 match(function() { return drawing.savedContext[0].fontWeight ;},drawing.fontWeight),
		 match(function() { return drawing.savedContext[0].lineHeight ;},drawing.lineHeight),
		 match(function() { return drawing.savedContext[0].textAlign  ;},drawing.textAlign),
		 function() {
			 drawing.setStrokeColor("#111111");
			 drawing.setStrokeWidth(10);
			 drawing.setLineCap("round");
			 drawing.setFillColor("#222222");
			 drawing.setFont(40, "bolder", "MS Gothic");
			 drawing.setTextAlign("end");
			 drawing.saveContext();
			 return drawing.savedContext.length == 2;
		 },
		 match(function() { return drawing.strokeColor;},"#111111"),
		 match(function() { return drawing.strokeWidth;},10),
		 match(function() { return drawing.lineCap    ;},"round"),
		 match(function() { return drawing.fillColor  ;},"#222222"),
		 match(function() { return drawing.fontFamily ;},"MS Gothic"),
		 match(function() { return drawing.fontWeight ;},"bolder"),
		 match(function() { return drawing.lineHeight ;},40),
		 match(function() { return drawing.textAlign  ;},"end"),
		 function() {
			 drawing.setStrokeColor("#333333");
			 drawing.setStrokeWidth(20);
			 drawing.setLineCap("XXXXX");
			 drawing.setFillColor("#444444");
			 drawing.setFont(80, "boldest", "MS Mincho");
			 drawing.setTextAlign("center");
			 drawing.restoreContext();
			 return drawing.savedContext.length == 1;
		 },
		 match(function() { return drawing.strokeColor;},"#111111"),
		 match(function() { return drawing.strokeWidth;},10),
		 match(function() { return drawing.lineCap    ;},"round"),
		 match(function() { return drawing.fillColor  ;},"#222222"),
		 match(function() { return drawing.fontFamily ;},"MS Gothic"),
		 match(function() { return drawing.fontWeight ;},"bolder"),
		 match(function() { return drawing.lineHeight ;},40),
		 match(function() { return drawing.textAlign  ;},"end"),
		 match(function() { drawing.restoreContext();		return drawing.savedContext.length;},0),
		 match(function() { return drawing.strokeColor;},drawing2.strokeColor),
		 match(function() { return drawing.strokeWidth;},drawing2.strokeWidth),
		 match(function() { return drawing.lineCap    ;},drawing2.lineCap),
		 match(function() { return drawing.fillColor  ;},drawing2.fillColor),
		 match(function() { return drawing.fontFamily ;},drawing2.fontFamily),
		 match(function() { return drawing.fontWeight ;},drawing2.fontWeight),
		 match(function() { return drawing.lineHeight ;},drawing2.lineHeight),
		 match(function() { return drawing.textAlign  ;},drawing2.textAlign),
]);

test("Drawing.setClipRect", [
		function() { drawing.setClipRect(1,2,3,4); return true; },
		match(function() { return drawing.clip.x; }, 1),
		match(function() { return drawing.clip.y; }, 2),
		match(function() { return drawing.clip.width; }, 3),
		match(function() { return drawing.clip.height; }, 4),
]);
test("Drawing.setScale", [
		function() { drawing.setScale(10,20); return true; },
		match(function() { return drawing.scale.x; }, 10),
		match(function() { return drawing.scale.y; }, 20),
		match(function() { return drawing.getTotalScale(); }, 15),
]);
test("Drawing.setStrokeColor/getStrokeColor", [
		match(function() { drawing.setStrokeColor("navy"); return drawing.getStrokeColor(); }, "navy"),
		match(function() { drawing.setStrokeColor("#000"); return drawing.getStrokeColor(); }, "#000"),
		match(function() { drawing.setStrokeColor(0); return drawing.getStrokeColor(); }, 0),
		match(function() { drawing.setStrokeColor(-1); return drawing.getStrokeColor(); }, -1),
		match(function() { drawing.setStrokeColor(100); return drawing.getStrokeColor(); }, 100),
		match(function() { drawing.setStrokeColor(null); return drawing.getStrokeColor(); }, null),
]);
test("Drawing.setStrokeWidth/getStrokeWidth", [
		match(function() { drawing.setStrokeWidth("navy"); return drawing.getStrokeWidth(); }, "navy"),
		match(function() { drawing.setStrokeWidth("#000"); return drawing.getStrokeWidth(); }, "#000"),
		match(function() { drawing.setStrokeWidth(0); return drawing.getStrokeWidth(); }, 0),
		match(function() { drawing.setStrokeWidth(-1); return drawing.getStrokeWidth(); }, -1),
		match(function() { drawing.setStrokeWidth(100); return drawing.getStrokeWidth(); }, 100),
		match(function() { drawing.setStrokeWidth(null); return drawing.getStrokeWidth(); }, null),
]);
test("Drawing.setLineCap/getLineCap", [
		match(function() { drawing.setLineCap("navy"); return drawing.getLineCap(); }, "navy"),
		match(function() { drawing.setLineCap("#000"); return drawing.getLineCap(); }, "#000"),
		match(function() { drawing.setLineCap(0); return drawing.getLineCap(); }, 0),
		match(function() { drawing.setLineCap(-1); return drawing.getLineCap(); }, -1),
		match(function() { drawing.setLineCap(100); return drawing.getLineCap(); }, 100),
		match(function() { drawing.setLineCap(null); return drawing.getLineCap(); }, null),
]);
test("Drawing.setFillColor/getFillColor", [
		match(function() { drawing.setFillColor("navy"); return drawing.getFillColor(); }, "navy"),
		match(function() { drawing.setFillColor("#000"); return drawing.getFillColor(); }, "#000"),
		match(function() { drawing.setFillColor(0); return drawing.getFillColor(); }, 0),
		match(function() { drawing.setFillColor(-1); return drawing.getFillColor(); }, -1),
		match(function() { drawing.setFillColor(100); return drawing.getFillColor(); }, 100),
		match(function() { drawing.setFillColor(null); return drawing.getFillColor(); }, null),
]);

test("Drawing.setFont/getFont", [
		match(function() { drawing.setFont("","",""); return drawing.getFont(); }, "px , "),
		match(function() { drawing.setFont(10,"normal","Meiryo"); return drawing.getFont(); }, "10px normal, Meiryo"),
]);

test("Drawing.setTextAlign/getTextAlign", [
        match(function() { drawing.setTextAlign("navy"); return drawing.getTextAlign(); }, "navy"),
        match(function() { drawing.setTextAlign("#000"); return drawing.getTextAlign(); }, "#000"),
        match(function() { drawing.setTextAlign(0); return drawing.getTextAlign(); }, 0),
        match(function() { drawing.setTextAlign(-1); return drawing.getTextAlign(); }, -1),
        match(function() { drawing.setTextAlign(100); return drawing.getTextAlign(); }, 100),
        match(function() { drawing.setTextAlign(null); return drawing.getTextAlign(); }, null),
]);
print_result();
