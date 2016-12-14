/*global console*/
export default function validate(decoded, cb) {
	//do something with decoded.(...)
	const date = new Date();
	if(decoded.exp <= date.getTime()) {
		cb(null, decoded.userID);
	}
	else {
		cb(new Error('token is expired'));
	}
}
