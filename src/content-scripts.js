function ob (x) {
	return document.getElementById(x);
}

// save editor frame of Gmail.
var element = '';
var editable = '';

// button to render extension frame
var e = document.createElement('div');
e.innerHTML = 'Encrypt';
e.id = 'eframe-cryptojs';
e.addEventListener('click', clickHandler);

setTimeout(function () {
	chrome.runtime.sendMessage({
			actionType: 'send-email-address',
			emailAddress: getEmailAddress()
		}, 
		function (response) {

	});
}, 3000);

/**
 * Render button
 */
function clickHandler() {
	// console.log('clicked');
	chrome.runtime.sendMessage(
		{
			actionType: 'open-encrypt-frame',
			emailContent: document.getElementsByClassName('Am Al editable LW-avf')[0].innerHTML,
		}, 
		function (response) {

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
		// console.log(jQuery('.dL'));
		// console.log(jQuery('.dL').children()[2]);
		// jQuery('.dL').children()[2].mousedown();
		// jQuery('.dL').children()[2].click();
		// jQuery('.dL').children()[2].mouseup();
		// try to bind Gmail editor
		editable = document.getElementsByClassName('Am Al editable LW-avf')[0];
		// toolbar in Gmail editor.
		var tr = document.getElementsByClassName('n1tfz')[0];
		var div = null;
		element = editable.parentElement;

		// if Gmail editor is opening
		if (tr != null){
			var check = 0;
			var td = tr.children[3];
			div = td.children[0];
			for (var i = 0; i < div.children.length; i++) {
				child = div.children[i];
				if (child.id == 'eframe-cryptojs'){
					check = 1;
					break;
				}
			}
			if (check != 1){
				// element.appendChild(e);
				e.setAttribute('class', 'wG J-Z-I btn btn-primary');
				div.appendChild(e);
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
		// console.log(sender);
		// console.log(request);
		editable.value = request.encryptedData;
		editable.innerHTML = request.encryptedData;
	}
});

/**
 * get Gmail Address of opening tab
 *
 * @return {string} Gmail Address
 */
function getEmailAddress () {
	var emailAddress = '';
	// Gmail
	if (window.location.hostname === 'mail.google.com'){
		var ea = document.getElementsByClassName('gb_ob')[0];
		// console.log('gb_ob');
		// console.log(ea.innerHTML);
		var emailRegex = /.+@.+\..+/;
		if (emailRegex.test(ea.innerHTML) !== false){
			return ea.innerHTML;
		}
		ea = document.getElementsByClassName('gb_pb')[0];
		// console.log('gb_pb');
		// console.log(ea.innerHTML);
		if (emailRegex.test(ea.innerHTML) !== false){
			return ea.innerHTML;
		}
		return false;
	}
}