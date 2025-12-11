console.log('js starting');
const FormField = document.querySelectorAll('.editfield');
FormField.forEach((form) => {
	form.addEventListener("focusout",postUpdatedField);
	console.log('added listener');
});

let timer;

// function that sends the post request when the selection changes off a form field
async function postUpdatedField(e) {
	try {
		// clear Timer
		console.log('focusout');
		clearTimeout(timer);

		// timer logic 2 seconds
		timer = setTimeout(() => {
			
			//console.log('test submist');
			e.target.form.submit();
		}, 5000);
	} catch (err) {
		console.log(err)
	}
}
