var ul = ob('ulKeys');

(function () {
	chrome.storage.sync.get('indexes', function (items) {
		if (!jQuery.isEmptyObject(items)){
			var indexes = items.indexes;
			indexes.forEach(function (i) {
				chrome.storage.sync.get(i, function (obs) {
					var key = obs[i];
					var li = document.createElement('li');
					li.innerHTML = i;
					if (key.isPairKey == 1){
						li.innerHTML += ' Full';
					}
					ul.appendChild(li);
				})
			})
		}
	})
})();

ob('btnImportPublicKey').addEventListener(function () {
	var pubkey = ob('pub').value;
	if (pubKey.length < 1){
		alert('Nhập public key.');
	}
	chrome.storage.sync
})