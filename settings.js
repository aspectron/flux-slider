function dpc(t,fn) { if(!fn) setTimeout(t,0); else setTimeout(fn,t); }

// ---
var SETTINGS = { };
SETTINGS.CONFIG = { 
	VIDEO_SHOW_DELAY : 0,
	VIDEO_TRANSITION_ADVANCE : 1000,
	VIDEO_NEXT_TRIGGER_POST_TRANSITION_ADVANCE : 0
};
SETTINGS.vars = { 
	
};

SETTINGS.CAPS = { SIGMA : true }

SETTINGS.CAPS.isNW = (typeof(nw) !== 'undefined' && typeof(nw.Window) !== 'underfined' && typeof(require) !== 'undefined');
if(SETTINGS.CAPS.isNW) {
	if(typeof(document) != "undefined" && document.location) {
	    var params = (new URL(document.location)).searchParams;
	    var _args = params.get("__args__");
	    console.log("I got args:",_args,document.location);
	    if(_args && _args.length)
	        SETTINGS.args = JSON.parse(_args);
	}
}

var _TIZEN_VERSION_MATCH_ = navigator.userAgent.match(/Tizen\s+(\d+\.\d+\.?\d*)/i);
if(_TIZEN_VERSION_MATCH_) {
	SETTINGS.CAPS.TIZEN = { version : _TIZEN_VERSION_MATCH_.pop() };
	SETTINGS.CAPS.SSSP4 = true; // assume SSSP4 for now by default
}

if(SETTINGS.CAPS.TIZEN) {
	SETTINGS.CONFIG.VIDEO_SHOW_DELAY = 1500;
	SETTINGS.CONFIG.VIDEO_TRANSITION_ADVANCE = 2500;
	SETTINGS.CONFIG.VIDEO_NEXT_TRIGGER_POST_TRANSITION_ADVANCE = 1000;
}