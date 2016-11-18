/*global console, process*/
import fs from 'fs';

let log = function log(info) {
  console.log(info);
}

export default {
  get: function get() {
    let files = fs.readdirSync(process.cwd())
    
  }
}
