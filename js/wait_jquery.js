var jq_callbacks = [];
function $(callback) { // (^^;
    jq_callbacks.push(callback);
}
(function() {
    // jQueryが使えるようになるまで待つ
    var check_count_max = 100;
    var check_count = 0;
    var wait_jquery = function () {
        window.setTimeout(function() {
            try {
                if(jQuery) {
                    for(var i = 0; i < jq_callbacks.length; i++) {
                        jq_callbacks[i].call(null, jQuery);
                    }
                } else {
                    throw "no jquery";
                }
            } catch(e) {
                check_count++;
                if(check_count < check_count_max) {
                    wait_jquery();
                } else {
                    $ = null;
                    for(var i = 0; i < jq_callbacks.length; i++) {
                        jq_callbacks[i].call(null, null);
                    }

                }
            }
        }, 300);
    }
    wait_jquery();
}());
