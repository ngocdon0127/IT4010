// id of Gmail tab.
var sourceTabId = '';

// gmail address
var emailAddress = '';

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({url: '/src/key-list.html'}, function (tab) {
		// body...
	});
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.actionType == 'open-encrypt-frame'){
		// Save Gmail tab id.
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			sourceTabId = tabs[0].id;
		});
		// open email editor.
		chrome.windows.create({
			url: '/src/email-editor.html',
			type: 'panel'
		});
	}
	else if (request.actionType === 'send-email-address'){
		emailAddress = request.emailAddress;
		return;
	}

	else if (request.actionType === 'get-email-address'){
		sendResponse({
			actionType: 'return-email-address',
			email: emailAddress
		});
		return;
	}

	// email editor window establishes a port to request email content from Gmail tab.
	chrome.extension.onConnect.addListener(function (port) {
		// Send email content to email editor window.
		port.postMessage({
			emailContent: request.emailContent
		});
		// receive encrypted email content.
		port.onMessage.addListener(function (msg) {
			if (msg.encryptedData != null){
				// send encrypted email to Gmail tab.
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(sourceTabId, {encryptedData: msg.encryptedData}, function (response) {
						
					});
				});
			}
		})
	});
});

// add context menu
chrome.contextMenus.create({
	title: "Decrypt this message.",
	contexts: ["selection"],
	onclick: clickHandler
});

// Context Menu click handler
function clickHandler (data, tab) {
	chrome.windows.create({
		url: "/src/decrypt-email.html",
		// type: "panel"
	});
	chrome.extension.onConnect.addListener(function(port) {
		port.postMessage({

			/**
			 * Character ZERO WIDTH SPACE (unicode u200B - 8203) 
			 * sometimes appears in selectionText when user double click.
			 * remove it and trim() string before sending to decrypt-email.html
			 */
			data: data.selectionText.replace(/\u200B/g, '').trim()
		});
	});
}

