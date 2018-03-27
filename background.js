var tranId;
var procId;
var openFlag = false;
var copyFlag = false;
var correctSite = false;	

browser.commands.onCommand.addListener((command) => {
	browser.tabs.query({currentWindow: true, active: true},function(tabs){
		currentUrl = tabs[0].url;
		correctSite = currentUrl.includes(".bigmachines.com/commerce/buyside/document.jsp");
		if(command === "open-xml" && correctSite){
			openFlag = true;
			browser.tabs.executeScript({file: "/manifest.js"});
			browser.runtime.onMessage.addListener((message => { //gets message from content_script, manifest.js
				tranId = message.value;
				procId = message.value2;
				if(openFlag) {
					buildXslUrl();
					openFlag = false;
				}		
			}))	
		}
		else if(command === "copy-trans" && correctSite){
			copyFlag = true;
			browser.tabs.query({currentWindow: true, active: true},function(tabs){
				browser.tabs.sendMessage(tabs[0].id,{message: "copy"});
			});
			browser.runtime.onMessage.addListener((response) => {
				if(copyFlag) {
					browser.notifications.create("copyid", {
						"type": "basic",
						//"iconUrl": browser.extension.getURL("icons/Info.png"),
						"title": "Transaction ID Copied!",
						"message": "Transaction ID is " + response.copiedValue
					});
					copyFlag = false;
				}
			})	
		}
	});
});

browser.notifications.onShown.addListener((id => {
	setTimeout(()=> {browser.notifications.clear("copyid");}, 3000 );	
}))
			
function buildXslUrl() {
	browser.tabs.query({currentWindow: true, active: true}, function(tabs){
		currentUrl = tabs[0].url;					//getting the current url of the active tab to retrieve the domain name
		var pos = currentUrl.search(".bigmachines.com");
		var pos1 = currentUrl.search("//");
		var subdomain = currentUrl.slice(pos1+2,pos);
		xslUrl = "https://" + subdomain + ".bigmachines.com/admin/commerce/views/list_xslt.jsp?process_id=" + procId;
		openXml(xslUrl,subdomain);
		flag = false;		
	});
}

function openXml(xslUrl,subdomain) {

	var xhttp = new XMLHttpRequest();			//Ajax call to get xslt_id from the views page
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var data = this.responseText;
			var toSearch = "edit_xslt.jsp?id=";
			var pos = data.indexOf(toSearch);
			var xslIdStr = data.substr(pos+toSearch.length,50);
			var newpos = xslIdStr.indexOf("\"");
			var xslId = xslIdStr.substr(0,newpos);	//retrieving xslt_id using string operations from the response
			var xmlUrl = "https://" + subdomain + ".bigmachines.com/admin/commerce/views/preview_xml.jsp?bs_id=" + tranId + "&xslt_id=" + xslId + "&view_type=document"
			browser.windows.create({url:xmlUrl});
		}
	};
	xhttp.open("GET",xslUrl,true);
	xhttp.send();
}
