function doConnect(config) {
	easyrtc.setVideoDims(640,480);
	easyrtc.enableDebug(true);
	easyrtc.setUsername (config.name);
	easyrtc.setRoomOccupantListener(config.users);
	easyrtc.setSocketUrl(config.server);
	easyrtc.easyApp("WebixWebRTC", "mirrorVideo", ["windowToUniverse"], function(id){
		config.$userId = id
	}, function(){
		webix.message({ type:"error", text:"Can't connect to WebRTC server" });
	});
}

function doCall(easyrtcid) {
	easyrtc.call(
		easyrtcid,
		function(easyrtcid) { 
			webix.message("completed call to " + easyrtcid);
		},
		function(errorMessage) { 
			webix.message({
				type:"error", text:errorMessage
			});
		},
		function(accepted, bywho) {
			webix.message("Call "+(accepted?"accepted":"rejected")+ " by " + bywho);
		}
	);
}