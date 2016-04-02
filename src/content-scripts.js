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


// code for fun.
// lang4u.com
function as(){
	jQuery('input.form-control').val(answer[jQuery('div.item').attr('data-index')]);
}

function ch(){
	jQuery('button.btn.btn-primary.check').click();
	jQuery('button.btn.btn-primary.checked').click();
	jQuery('button.btn.btn-primary.re-practive').click();
}

var answer;

if (window.location.hostname == 'lang4u.com'){
	console.log('chay thoi');
	jQuery('meta[name="viewport"]').attr('content', '3');
	jQuery('meta[name="viewport"]').attr('http-equiv', 'refresh');
	jQuery('button.btn.btn-primary.practive').click();

	answer = {
		0: 'tuân theo',
		2: 'sự tin chắc',
		3: 'Việc hủy chuyến bay đã gây cho cô ấy nhiều vấn đề trong những ngày còn lại của tuần',
		5: 'He engaged us in a fascinating discussion about current business law',
		6: 'thiết lập',
		7: 'obligate',
		8: 'Các bên đã nhất trí đi đến một thỏa thuận trong hợp đồng gây tranh cãi của họ',
		9: 'provision',
		11: 'specific'
	}

	jQuery('button.btn.btn-primary.check').click(function () {
		// console.log(answer[jQuery('div.item').attr('data-index')]);
		// console.log(jQuery('input.form-control'));
		$('input.form-control').val(answer[jQuery('div.item').attr('data-index')]);
	})


	setInterval(function(){
		jQuery('button.btn.btn-primary.check').click();
		jQuery('button.btn.btn-primary.checked').click();
		jQuery('button.btn.btn-primary.re-practive').click();
	}, 30);
}

// end of lang4u.com