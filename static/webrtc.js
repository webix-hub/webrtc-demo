function doConnect(config) {
	easyrtc.setVideoDims(640,480);
	easyrtc.setUsername (config.name);
	easyrtc.setRoomOccupantListener(config.users);
	easyrtc.setSocketUrl(config.server);
	easyrtc.easyApp("WebixWebRTC", "mirrorVideo", ["windowToUniverse"], function(id){
		config.$userId = id
	}, function(){
		webix.message({ type:"error", text:"Can't connect to WebRTC server" });
	});

	easyrtc.setPeerClosedListener(function(){
		if ($$("endcall").isVisible()){
			$$("endcall").hide();
			$$("status").setValue("");
			webix.message("You was disconnected");
		}
	});	
	easyrtc.setAcceptChecker( function(caller, cb) {
        var name = easyrtc.idToName(caller);
        var callback = function(wasAccepted) {
            if( wasAccepted){
            	if (easyrtc.getConnectionCount() > 0 )
                	easyrtc.hangupAll();
                $$("endcall").show();
                $$("status").setValue(name);
            }
            cb(wasAccepted);
        };

        if( easyrtc.getConnectionCount() > 0 )
        	webix.confirm({ text:"Drop current call and accept new from " + name + " ?", callback });
        else
            webix.confirm({ text: "Accept incoming call from " + name + " ?", callback });

    });
}

function doCall(easyrtcid) {
	if (easyrtcid < 0) return false;

	$$("status").setValue("Connecting...")
	easyrtc.call(
		easyrtcid,
		function(caller) { 
			$$("endcall").show();
			$$("status").setValue(easyrtc.idToName(caller));
		},
		function(errorMessage) { 
			webix.message({
				type:"error", text:errorMessage
			});
		},
		function(accepted, caller) {
			if (!accepted){
				webix.message(easyrtc.idToName(caller)+" has rejected your call");
				$$("status").setValue("");
			}
		}
	);
}