let say = function say(err) {
	console.log(err);
};


prom(true).then(say, say);

function prom(val) {
	return new Promise((resolve, reject) => {
		if(val) {
			resolve('success!');
		}
		else {
			reject('failed!');
		}
	});
}
