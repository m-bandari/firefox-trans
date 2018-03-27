
var tranId = getId();
var procId = getProcId();

browser.runtime.sendMessage({			//sending message to background script
	value: tranId, value2: procId
});

browser.runtime.onMessage.addListener(copyTrans);

function getId() {			//To get transaction ID from the quote page
  	var tranId = document.getElementsByName("id")[0].value;
  	return tranId;
}

function getProcId() {			//To get commerce process ID from the quote page
	var procId = document.getElementsByName("bm_cm_process_id")[0].value;
	return procId;
}

function copyTrans(request) {	//function to copy transaction ID to clipboard
	if(request.message === "copy") {
		var tran_Id = document.getElementsByName("id")[0].value;
		var tranSelectBox = document.createElement("INPUT");
		tranSelectBox.setAttribute("type", "text");
		tranSelectBox.setAttribute("id", "scdegb");
		document.body.appendChild(tranSelectBox);
		var tempText = document.getElementById("scdegb");
		tempText.value = tran_Id;
		tempText.select();
		document.execCommand("copy");
		document.body.removeChild(tempText);
		browser.runtime.sendMessage({
			copiedValue: tran_Id
		});
	}
}
