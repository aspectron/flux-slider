var PLAYERS = 0;
function SFXVideo(player, config) {
	var self = this;
	self.config = config;
	var DEBUG = config.debug;
	config.imgType = config.imgType || "jpg";
	config.imgUpdateInterval = config.imgUpdateInterval || 10;
	var doc = document;

	//this.imgEl = $(config.img);

	self.el = doc.createElement("div");
	self.el.classList.add("sxf-item")
	self.el.classList.add("sxf-video");

	var testImage = null;
	if(DEBUG){
		testImage = doc.createElement("img");
		testImage.classList.add("test-image");
		doc.body.appendChild(testImage)
	}

	self.compatibility = false;
	var logEl = doc.getElementById("log");
	var id = PLAYERS++;

	function log(t) {
		if(logEl)
			logEl.innerHTML += id+': '+t+'<br/>';
	}

	var video = null;
	var isPlaying = false;

	self.render = function(el) {
		//var children = el.querySelectorAll("*");
		//for(var i = 0; i < children.length; i++)
		//	children[i].remove();

		if(!video) {
			video = document.createElement("video");
			
			if(SETTINGS.CAPS.TIZEN)
				video.classList.add("tizen");

			video.autoplay = false;
			video.src = player.buildFilePath(config.content);
			video.addEventListener("playing", function() {
				self.onVideoPlaying();
			});
			video.addEventListener("ended", function() {
				self.onVideoEnd();
			});
			video.addEventListener("timeupdate", function() {
				self.onVideoTimer();
			});			

			if(config.muted)
				video.muted = true;
			if(config.loop)
				video.loop = true;

			//hide video
			video.style.position = "fixed";
			video.style.left = "-10000000px";

			this.createCanvas(100, 100);
		}

		self.el.appendChild(video);
		el.appendChild(self.el);
		self.container = el;
	};

	self.cleanUp = function() {
		if(video) {
			video.pause();
			video.src = "about:blank";
			video.load();
			video.remove();
		}
		this.stopCapturing();
	};
	self.pause = function() {
		video.pause();
	};
	self.stop = function() {
		log("stop()");
		// video.pause();
		// video.src = this.video.src;
		this.stopCapturing();
	};

	self.play = function(onEnd) {
		log("play()");
		video.play();
		self.onEnd = onEnd;
	};

	this.startCapturing = function(){
		this.stopCapturing();
		var img = self.config.img || {};
		this._capturingId = setInterval(function(){
			var src = self.capture();
			$(self.config.bgImages).css({
				"background-image": 'url("'+src+'")'
			})
			img.src = src;
			DEBUG && (testImage.src = src);
		}, config.imgUpdateInterval)
		
	}
	this.stopCapturing = function(){
		if(this._capturingId){
			clearInterval(this._capturingId)
			this._capturingId = null;
		}
	}

	self.onVideoPlaying = function(e){
		this.updateCanvasSize();

		this.startCapturing();

		if(isPlaying)
			return;
		isPlaying = true;

		log("onVideoPlaying");
		dpc(SETTINGS.CONFIG.VIDEO_SHOW_DELAY, function(){
			log("settingActive");

			video.classList.add("active");
		})

		//console.log('displaying...');
		// console.log("onVideoEnd", e, this.onEnd)
		// if(!this.onEnd)
		// 	return;
		// var onEnd = this.onEnd;
		// this.onEnd = null;
		// onEnd();
	};

	self.onVideoEnd = function(e){
		this.stopCapturing();
		//console.log("onVideoEnd", e, this.onEnd)
		if(!self.onEnd)
			return;

		isPlaying = false;

		video.classList.remove("active");

		var onEnd = self.onEnd;
		self.onEnd = null;
		dpc(function() {
			onEnd();
		})
	}

	this.createCanvas = function(width, height){
		if(this.canvas){
			this.updateCanvasSize(this.canvas, width, height)
			return this.canvas;
		}
		this.canvas = doc.createElement("canvas");
		this.canvas.classList.add("video");
		this.updateCanvasSize(this.canvas, width, height)

		// Hide the canvas
		//canvas.style.display = "none";
		doc.body.appendChild( this.canvas );
		this.canvasContext = this.canvas.getContext("2d");

		return this.canvas;
	}
	this.getCanvas = function(width, height){
		this.updateCanvasSize(this.canvas, width, height)
		return this.canvas;
	}
	this._updateCanvasSize = function(canvas, width, height){
		this.canvasWidth = width;
		this.canvasHeight = height;
		var ratio = 1;//this.getPixelRatio();
		canvas.width = width;// * ratio;
		canvas.height = height;// * ratio;
		//canvas.style.width = width+"px";
		//canvas.style.height = height+"px";
		//canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
	}
	this.getPixelRatio = function(){
    	var ctx = this.canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    	return dpr / bsr;
	}

	this.updateCanvasSize =function(){
		var width = video.videoWidth || config.videoWidth || $(self.container).width();
		var height = video.videoHeight || config.videoHeight || $(self.container).height();
		this._updateCanvasSize(this.canvas, width, height);
	}

	this.capture = function(){
		// Get the canvas's context for reading/writing
		this.canvasContext.drawImage(video, 0, 0, this.canvasWidth, this.canvasHeight);
		return this.canvas.toDataURL( "image/" + this.config.imgType );
	}

	self.onVideoTimer = function(e){
		var delta = (video.duration - video.currentTime) * 1000;
		if(delta < SETTINGS.CONFIG.VIDEO_TRANSITION_ADVANCE) {

			if(!self.onEnd)
				return;

			log("onVideoTimer - END");

			var onEnd = self.onEnd;
			self.onEnd = null;
			dpc(function() {
				log("onVideoTimer - DEACTIVATE");

				isPlaying = false;
					onEnd();

				dpc(SETTINGS.CONFIG.VIDEO_NEXT_TRIGGER_POST_TRANSITION_ADVANCE,function() {
					video.classList.remove("active");
				})
			})
		}
	}
}