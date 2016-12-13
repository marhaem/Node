/**
 *
 */
export default function setBestAvailableCipher() {
  for(let cipher in this.goodCiphers) {
    if(this.availableCiphers.indexOf(this.goodCiphers[cipher]) !== -1) {
      this.CIPHER = this.goodCiphers[cipher];
    }
  }
  if(!this.CIPHER) {
    throw new Error('No good cipher found');
  }
}
