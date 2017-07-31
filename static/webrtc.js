var config = {
	server:"/",
	users:function(room, people, me){
		var list = $$("contactsList");
		list.clearAll();

		if (config.name)
			list.add({ 
				id:-1, 
				img:"images/avatar.jpg", 
				title: config.name + " ( this is Me )" });

		for (var key in people){
			var v = people[key];
			list.add ({
				id: v.easyrtcid,
				img: "images/avatar.jpg",
				title: v.username
			});
		}
	}
};

var contactsList = {
	header : "Rooms",
	view : "list",
	id : "contactsList",
	template : `
		<div class='contactPaneDiv'>
			<img class="contactIcon" src="#img#"/>
			<span class="contactTextDiv">#title#</span>
		</div>
	`,
	item : {
		height: 80,
		width: 300,
	},
	select:true, scroll:false,
	on:{ onBeforeSelect: (id) => doCall(id) }
};

var chat = {
	css:"absarea",
	template:`<div class='mirrorDiv'><video id='mirrorVideo' width></div>
				<div class='windowToUniverseDiv'><video id='windowToUniverse'></div>`
};


function funnyName(){
	var first = ["Agile", "Strong", "Tricky", "Shiny", "Gloom"];
	var second = ["Tree", "Cat", "Boss", "User", "Rabbit"];

	return first[Math.floor(Math.random()*first.length)] + " " + second[Math.floor(Math.random()*second.length)];
}

function doConnect(config) {
	easyrtc.setVideoDims(640,480);
	easyrtc.setUsername (config.name);
	easyrtc.setRoomOccupantListener(config.users);
	easyrtc.setSocketUrl(config.server);
	easyrtc.easyApp("WebixWebRTC", "mirrorVideo", ["windowToUniverse"], function(id){
		config.$userId = id
	}, function(code){

  		var text = "Connection failed";
		if(code === "MEDIA_ERR") text += ". Cannot find a local web camera";
		if(code === "MEDIA_WARNING") text += ". Video width and height are inappropriate";
		if(code === "SYSTEM_ERR") text += ". Check your network settings";
		if(code === "ALREADY_CONNECTED") text += ". You are already connected";

		webix.message({ type:"error", text: text});
	});

	easyrtc.setPeerClosedListener(function(){
		if ($$("endcall").isVisible()){
			$$("endcall").hide();
			$$("status").setValue("");
			webix.message("You were disconnected");
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
        	webix.confirm({ text:"Drop the current call and accept the new one from " + name + " ?", callback });
        else
            webix.confirm({ text: "Accept an incoming call from " + name + " ?", callback });

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


webix.ready(function(){

	webix.ui({
		rows : [
			{ view:"toolbar", cols:[
				{ view:"label", label : "Webix WebRTC Chat" },
				{},
				{ view:"label", id:"status", css:"status", value:"", width: 200 },
				{ view:"button", id:"endcall", value:"End Call", width: 100, click:function(){
					$$("endcall").hide();
					easyrtc.hangupAll();
					$$("contactsList").unselectAll()
					$$("status").setValue("");
				}, hidden:true }
			]},
			{ cols :[
				contactsList,
				chat
			]}
		]
	});

	var win = webix.ui ({
		view: "window", position:"top", head:false, modal:true,
		body: {
			view:"form", rows:[
				{ view:"text", name:"name", label:"Your name", value:funnyName() },
				{ view:"button", value:"Start!", click:function(){
					var name = this.getFormView().getValues().name;
					if (!easyrtc.isNameValid (name))
						webix.message({ type:"error", text:"Invalid name" });
					else {
						this.getTopParentView().hide();
						config.name = name;
						doConnect(config);
					}
				}}
			]
		}
	});

	win.show();
	var input = win.getBody().elements.name.getInputNode();
	input.select(); input.focus();
});