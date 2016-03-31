// Constants

// Master key.
// Extension use this key to encrypt original public & private key with AES algorithm
// generate using MD5('local_key_extension_attt');
var LOCAL_KEY = '8499a08c77ba81cd35d8e93642da34b6';

// Extension saves data to this StorageArea
var STORAGE_AREA = chrome.storage.sync;

function ob (x) {
	return document.getElementById(x);
}

function preEncrypt(x) {
	return CryptoJS.AES.encrypt(x, LOCAL_KEY);
}

function preDecrypt (x) {
	return CryptoJS.AES.decrypt(x, LOCAL_KEY).toString(CryptoJS.enc.Utf8);
}


// Add new email to indexes list.
function addIndexes (email) {
	STORAGE_AREA.get('indexes', function (items) {
		var indexes = [];
		if (jQuery.isEmptyObject(items)){
			indexes = [email];
		}
		else{
			items.indexes.push(email);
			indexes = items.indexes;
		}
		chrome.storage.sync.set({
			indexes: indexes
		}, function () {
			// console.log('ok');
		});
	});
}