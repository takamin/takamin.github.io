var total_pass_count = 0;
var total_fail_count = 0;
var report_pass = false;
var report_result = false;
var E=console.error;
function match(f,e) {
	if(typeof(f)=='function') {
		return function(){var r=f();if(r==e)return 1;E(f+' do not returns '+e+',but '+r+'.');return 0;}
	}
	return function(){r=f;if(f==e)return 1;E(f+'!='+e+'.');return 0;}
}
function not_match(f,e) {
	if(typeof(f)=='function') {
		return function(){var r=f();if(r!=e)return 1;E(f+' returns '+e+'.');return 0;}
	}
	return function(){r=f;if(f!=e)return 1;E(f+'=='+e+'.');return 0;}
}
function test(test_name, tests) {
	var test_count = tests.length;
	var pass_count = 0;
	var fail_count = 0;
	for(var i = 0; i < test_count; i++) {
		var test_content = "" + tests[i];
		var test_result = "";
		var test_pass = tests[i]();
		if(test_pass) {
			test_result = "PASS";
			pass_count++;
			total_pass_count++;
		} else {
			test_result = "FAIL";
			fail_count++;
			total_fail_count++;
		}
		if(report_pass || !test_pass) {
			console.info("test '" + test_name + "' ["+(i+1)+"/"+test_count+"] - " + test_result + ": " + test_content);
		}
	}
	if(report_result) {
		print_result(test_name, pass_count, fail_count);
	}
}
function print_result(test_name, pass_count, fail_count) {
	test_name = test_name || "ALL";
	pass_count = pass_count || total_pass_count;
	fail_count = fail_count || total_fail_count;
	
	var test_count = pass_count + fail_count;
	var pass_ratio = Math.round(100 * pass_count / test_count, 2);
	console.info("*** test '" + test_name +
			"' pass ratio " + pass_ratio +
			"% - test case total " + test_count +
			" / pass " + pass_count +
			" / fail " + fail_count);
}