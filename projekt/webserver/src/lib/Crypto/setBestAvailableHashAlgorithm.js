/**
 *
 */
export default function setBestAvailableHashAlgorithm() {
  for(let hash in this.goodHashAlgorithms) {
    if(this.availableHashAlgorithms.indexOf(this.goodHashAlgorithms[hash]) !== -1) {
      this.HASH_ALGORITHM = this.goodHashAlgorithms[hash];
    }
  }
  if(!this.HASH_ALGORITHM) {
    throw new Error('No good hash algorithm found');
  }
}
