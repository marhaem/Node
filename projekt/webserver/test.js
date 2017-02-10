const l = (x) => {console.log(x)};
let bs = new Buffer(16); // for string
let bi = new Buffer(16); // for integer

let os = bs.write('Hello', 'utf-8');
let c = 65;
bi.write(c.toString(), 'utf-8');

let str = new Buffer();
l(str.toString());

return;

os += b.write(' world', os, 'utf-8');

let a = b.toString('ascii');
let u = b.toString('utf-8')

//console.log('#ascii\n' + a + '#');
//console.log('#utf-8\n' + u + '#');
//console.log('#utf-8 with os\n' + b.toString('utf-8', 0, os) + '#');

//a.replace(/( )*/g, '');



console.log(u + '#');


function myTrimRight(z) {
	var i;
	for(i=z.length-1; i>=0; i--) {
		if(z.charAt(i) === '\0')
			console.log('#null byte at index: ' + i);
		if(z.charAt(i) === ' ') {
			console.log('#first whitespace at index ' + i);
			return z = z.slice(1, i);
			break;
		}
	}
}

function myTrim(z) {
	var i;
	for(i=0; i<z.lentgh; i++) {
		if(z.charAt(i) === '\0')
			console.log('#null byte at index: ' + i);
			return z = z.slice(0, i+1);
			break;
	}
}

