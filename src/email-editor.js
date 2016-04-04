'use strict';
// use this key to encrypt attachments.
var aesKeyFile = '';

var ew = undefined;
var files = undefined;

// connect to background page right after the init time to get email content.
var port = chrome.extension.connect({name: "get-email-content"});
// receive email content from background page.
port.onMessage.addListener(function (msg) {
	if (msg.emailContent != null){
		$('#text').html(function () {
			return msg.emailContent;
		});
	}
});

// Transfer encrypted email to Gmail tab.
ob('btnTransfer').addEventListener('click', function () {
	console.log('transfer');
	console.log($('#encrypted').val());
	// connect to background page.
	var port = chrome.extension.connect({name: 'transfer-encrypted-data'});
	// send encrypted email to background page.
	port.postMessage({
		encryptedData: $('#encrypted').val()
	});
	window.close();
});

/**
 * Log chosen files to console. Just for debugging.
 */
function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);

/**
 * Encrypt attachments
 *
 * @param {evt} event button clicked or null
 */
function encryptFile (evt) {
	var date1 = new Date();
	files = ob('attach').files;
	console.log(files);
	ob('btnEncrypt').disabled = true;
	ob('btnEncrypt').innerHTML = 'Encrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(ew) == 'undefined'){
			ew = new Worker('file-worker.js');
			ew.postMessage({
				type: 'encrypt',
				files: files,
				key: aesKeyFile
			});
		}
		ew.onmessage = function (event) {
			ob('btnEncrypt').classList.remove('loading');
			ob('btnEncrypt').removeAttribute('disabled');
			ob('file-info').value = 'File has been encrypted.';
			var tmpcipher = event.data.cipher;
			var filenames = event.data.filenames;
			var data = event.data.data.split('?');
			filenames = data[0];
			tmpcipher = data[1];
			var arrCipher = tmpcipher.split(STR_SEPERATOR);
			ob('file-info').value = '';
			var fCipher = '';
			for (var i = 0; i < arrCipher.length; i++) {
				var f = arrCipher[i];
				fCipher += f + STR_SEPERATOR;
				var oldSize = files[i].size;
				var tmpbrowser = event.data.browser;
				ob('file-info').value += "\n\nName: " + files[i].name + ".";
				ob('file-info').value += "\nOriginal Size: " + (oldSize / 1024 / 1024).toFixed(2) + " MiB.";
				ob('file-info').value += "\nSize after Encrypting: " + (f.length / 1024 / 1024).toFixed(2) + " MiB.";
				ob('file-info').value += "\nBrowser: " + tmpbrowser + ".";
			}
			fCipher = fCipher.substring(0, fCipher.length - STR_SEPERATOR.length);
			console.log(fCipher.substring(fCipher.length - 10));
			saveAs(new Blob([event.data.data], {Type: 'text/plain'}), 'attachments.encrypted');
			ew.terminate();
			ew = undefined;
			aesKeyFile = '';
			files = undefined;
		}
	}
	else{
		alert('This browser does not support web worker.');
	}
}

ob('btnEncrypt').addEventListener('click', encryptEmail);

/**
 * Insert data to select element
 */
(function () {
	STORAGE_AREA.get('indexes', function (items) {
		var indexes = items.indexes;
		if (typeof(indexes) !== 'undefined'){
			indexes.forEach(function (it) {
				STORAGE_AREA.get(it, function (key) {
					key = key[it];
					if (typeof(key) !== 'undefined'){
						var opt = document.createElement('option');
						var data = preDecrypt(key.public).split('|');
						opt.value = data[1];
						opt.innerHTML = data[1];
						ob('slRecipient').appendChild(opt);
					}
				})
			})
		}
	})
})();

// Number of recipients
var noOfRecipients = 0;

// Number of encrypted email for recipients
var encryptedEmail = 0;

/**
 * Encrypt the whole email
 */
function encryptEmail () {
	// reset field.
	jQuery('#encrypted').val('');
	// generate a random key
	aesKeyFile = (new Date()).getTime() + ' ';
	aesKeyFile = CryptoJS.MD5(aesKeyFile).toString(CryptoJS.enc.Base16);

	// add aesKeyFile to the original email.
	// send it to recipient.
	// so that recipient can decrypt attachments.
	var plainText = ob('text').innerHTML + '|' + aesKeyFile;
	var sl = ob('slRecipient');
	var flags = {
		ef: 0
	}

	// Count number of recipients
	for (var i = 0; i < sl.options.length; i++) {
		var opt = sl.options[i];
		if (opt.selected){
			noOfRecipients++;
		}
	}

	// Encrypt email for recipients.
	for (var i = 0; i < sl.options.length; i++) {
		var opt = sl.options[i];
		if (opt.selected){
			var recipient = opt.value;
			log('start encrypting email for ' + opt.value);
			ee(recipient, plainText, flags);
		}
	}
	var interval = setInterval(function () {
		log(encryptedEmail + ' / ' + noOfRecipients + ' done.');
		// finish encrypting
		if (encryptedEmail >= noOfRecipients){
			var encryptedEmailContent = ob('encrypted').value;
			// remove the last STR_SEPERATOR
			ob('encrypted').value = encryptedEmailContent.substring(0, encryptedEmailContent.length - STR_SEPERATOR.length);
			clearInterval(interval);
			jQuery('#encrypted').fadeIn();
			log('done');
			if (ob('attach').files.length < 1){
				ob('btnEncrypt').classList.remove('loading');
				ob('btnEncrypt').removeAttribute('disabled');
			}
		}
	}, 1);
}

/**
 * Encrypt 1 single email for 1 recipient.
 *
 * @param {recipient} Email address of recipient
 * @param {plainText} The original email that will be encrypt
 * @param {obj} Flags
 */
function ee (recipient, plainText, obj) {
	chrome.storage.sync.get(recipient, function (items) {
		var key = items[recipient];
		if (typeof(key) !== 'undefined'){
			var data = preDecrypt(key.public);
			data = data.split('|');
			if (data[1] != recipient){
				alert('Email is not matched.');
				return;
			}
			var publicKey = data[0];
			var cipher = cryptico.encrypt(unescape(encodeURIComponent(plainText)), publicKey);
			ob('encrypted').value += preEncrypt(cipher.cipher + '|' + recipient) + STR_SEPERATOR;
			encryptedEmail++;

			// Attachments should be encrypted one single time.
			if (obj.ef == 0){
				if (ob('attach').files.length > 0){
					encryptFile();
					obj.ef = 1;
				}
			}
		}
	})
}

// Add loading effect for button
ob('btnEncrypt').addEventListener('click', BUTTON_LOADING);
