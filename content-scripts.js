function ob (x) {
	return document.getElementById(x);
}

var element = '';
var editable = '';
var e = document.createElement('div');
e.innerHTML = 'hehe';
e.id = 'eframe-cryptojs';
e.addEventListener('click', clickHandler);
function clickHandler() {
	console.log('clicked');
	chrome.runtime.sendMessage({
			actionType: 'open-encrypt-frame',
			emailContent: document.getElementsByClassName('Am Al editable LW-avf')[0].innerHTML
		}, 
		function (response) {
			console.log(response);
	})
}
var interval;
setTimeout(function () {
	interval = setInterval(fRender, 1000);
}, 5000);
var fRender = function () {
	// console.log('fRender');
	try{
		editable = document.getElementsByClassName('Am Al editable LW-avf')[0];
		element = editable.parentElement;
		// console.log(element);
		// console.log(element.children.length);
		if (element != null){
			var check = 0;
			// console.log('element has ' + element.children.length + ' children.');
			for (var i = 0; i < element.children.length; i++) {
				child = element.children[i];
				// console.log(child.id);
				if (child.id == 'eframe-cryptojs'){
					check = 1;
					break;
				}
			}
			if (check != 1){
				// for (var i = 0; i < element.children.length; i++) {
				// 	element.removeChild(element.children[i]);
				// }
				element.appendChild(e);
				// clearInterval(interval);
				// console.log('added');
			}
			else{
				// console.log('not');
			}
		}
	}
	catch (e){

	}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.encryptedData != null){
		console.log(request.encryptedData);
		editable.value = request.encryptedData;
		editable.innerHTML = request.encryptedData;
	}
});

chrome.runtime.sendMessage({testData: 'test messaging'}, function (response) {
	
});