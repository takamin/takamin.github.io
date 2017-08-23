function Prime() {
    this.primes = [];
    this.num = 1;
}
Prime.prototype.isPrime = function(n) {
    for(var i = 0; i < this.primes.length; i++) {
        if((n % this.primes[i]) == 0) {
            return false;
        }
    }
    return true;
}
Prime.prototype.getNextPrime = function() {
    while(true) {
        this.num++;
        if(this.isPrime(this.num)) {
            this.primes.push(this.num);
            return this.num;
        }
    }
    return null;
};
Prime.prototype.getLastPrime = function() {
    if(this.primes.length <= 0) {
        return null;
    }
    return this.primes[this.primes.length - 1];
};
Prime.prototype.getPrimes = function() {
    return this.primes;
};
Prime.prototype.findPrimes = function(count) {
    var i = 0;
    while(i < count) {
        if(this.getNextPrime() != null) {
            i++;
        }
    }
    return this.getLastPrime();
};
