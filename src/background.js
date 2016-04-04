// id of Gmail tab.
var sourceTabId = '';

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({url: '/src/popup.html'}, function (tab) {
		// body...
	});
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.actionType == 'open-encrypt-frame')
	chrome.windows.create({
		url: '/src/email-editor.html',
		type: 'panel'
	});
	chrome.extension.onConnect.addListener(function (port) {
		port.postMessage({
			emailContent: request.emailContent
		});
		port.onMessage.addListener(function (msg) {
			if (msg.encryptedData != null){
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(sourceTabId, {encryptedData: msg.encryptedData}, function (response) {
						
					});
				});
			}
		})
	})
	sendResponse({
		data: 'hihi'
	});
});



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.testData != null){
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {encryptedData: 'hehe'}, function (response) {
				sourceTabId = tabs[0].id;
			});
		});
	}
});

// add context menu
chrome.contextMenus.create({
	title: "Decrypt this message.",
	contexts: ["selection"],
	onclick: clickHandler
});

// Context Menu click hander
function clickHandler (data, tab) {
	chrome.windows.create({
		url: "/src/decrypt-email.html",
		type: "panel"
	});
	var b = true; // detect if user use context menu
	chrome.extension.onConnect.addListener(function(port) {
		port.postMessage({
			contextMenu: b,

			// Character ZERO WIDTH SPACE (unicode u200B - 8203) 
			// sometimes appears in selectionText when user double click.
			// remove it and trim() string before sending to decrypt-email.html
			data: data.selectionText.replace(/\u200B/g, '').trim()
		});
		b = false;
	});
}

// // Get Gmail address
// function getCurrentGmailAddr () {
// 	alert('start hehe');
// 	var e = document.getElementsByName('tôi');
// 	alert(e.length);
// 	if (e.length < 1){
// 		e = document.getElementsByName('me');
// 	}
// 	alert(e[0].getAttribute('email'));
// }