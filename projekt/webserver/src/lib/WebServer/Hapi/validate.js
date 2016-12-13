/*global console*/
export default function validate(decoded, cb) {
	//do something with decoded.(...)
	const date = new Date();
	if(decoded.exp <= date.getTime()) {
		console.log('decoded: ' + JSON.stringify(decoded));
		cb(null, decoded.id);
	}
	else {
		cb(new Error('token is expired'));
	}
}
