HTMLVideoElement.prototype.base_pause = HTMLVideoElement.prototype.pause;
HTMLVideoElement.prototype.pause = function(pauseHandler) {
	if(pauseHandler != null) {
		var THIS = this;
		this.addEventListener("pause", function() {
			THIS.removeEventListener("pause", arguments.callee, false);
			pauseHandler();
		});
	}
	this.base_pause();
};
HTMLVideoElement.prototype.setCurrentTime = function(position, timeupdateHandler) {
	if(timeupdateHandler != null) {
		var THIS = this;
		this.addEventListener("timeupdate", function() {
			THIS.removeEventListener("timeupdate", arguments.callee, false);
			timeupdateHandler();
		});
	}
	this.currentTime = position;
};
