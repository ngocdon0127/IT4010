function ob (x) {
	return document.getElementById(x);
}

// save editor frame of Gmail.
var element = '';
var editable = '';

// button to render extension frame
var e = document.createElement('div');
e.innerHTML = 'hehe';
e.id = 'eframe-cryptojs';
e.addEventListener('click', clickHandler);

// render function
function clickHandler() {
	console.log('clicked');
	chrome.runtime.sendMessage({
			actionType: 'open-encrypt-frame',
			emailContent: document.getElementsByClassName('Am Al editable LW-avf')[0].innerHTML
		}, 
		function (response) {
			console.log(response);
	});
}

var interval;

// render extension button after DOM loaded 5s.
setTimeout(function () {
	// Try to render every 1000
	interval = setInterval(fRender, 1000);
}, 5000);
var fRender = function () {
	try{
		editable = document.getElementsByClassName('Am Al editable LW-avf')[0];
		element = editable.parentElement;

		// if Gmail editor is opening
		if (element != null){
			var check = 0;
			for (var i = 0; i < element.children.length; i++) {
				child = element.children[i];
				if (child.id == 'eframe-cryptojs'){
					check = 1;
					break;
				}
			}
			if (check != 1){
				element.appendChild(e);
			}
			else{
			}
		}
	}
	catch (e){

	}
}

// receive encrypted email
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.encryptedData != null){
		console.log(request.encryptedData);
		editable.value = request.encryptedData;
		editable.innerHTML = request.encryptedData;
	}
});

// just send test message to get this tab id.
chrome.runtime.sendMessage({testData: 'test messaging'}, function (response) {
	
});