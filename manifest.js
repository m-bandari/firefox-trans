var tranId;
var procId;

browser.runtime.onConnect.addListener(p => {
  p.onMessage.addListener(message => {
    console.log("isLegacy " + message.isLegacy);
    if (message.isLegacy == "true") {
      tranId = document.getElementsByName("id")[0].value;
      procId = document.getElementsByName("bm_cm_process_id")[0].value;
      p.postMessage({ tid: tranId, pid: procId });
    } else if (message.isLegacy == "false" && message.tabUrl != "") {
      var currentTabUrl = message.tabUrl;
      var currentTabUrlFragmentsArr = currentTabUrl.split("/");
      tranId = currentTabUrlFragmentsArr[currentTabUrlFragmentsArr.length - 1];
      var processMetadataUrl =
        "https://" +
        currentTabUrlFragmentsArr[2] +
        "/rest/v8/commerceProcesses/" +
        currentTabUrlFragmentsArr[5] +
        "/documents";
      console.log(processMetadataUrl);
      fetch(processMetadataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("Fetching process documents failed.");
          }
          response.json().then(jsonData => {
            procId = jsonData.items[0].process.id;
          });
        })
        .catch(error => {
          console.error("Problem fetching Process ID: ", error);
        });
      p.postMessage({ tid: tranId, pid: procId });
    }
  });
});

/*browser.runtime.sendMessage({
  //sending message to background script
  value: tranId,
  value2: procId
});

function getId() {
  //To get transaction ID from the quote page
  var tranId = document.getElementsByName("id")[0];
  if (typeof tranId === "undefined") {
    return 0;
  }
  return tranId.value;
}

function getProcId() {
  //To get commerce process ID from the quote page
  var procId = document.getElementsByName("bm_cm_process_id")[0].value;
  return procId;
}*/

/*function copyTrans(request) {	//function to copy transaction ID to clipboard
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
}*/
