/** @license ipv4calc
 * (c) 2015 Eshin Kunishima.
 *
 * The MIT License (MIT)
 * http://opensource.org/licenses/MIT
 */
/*
 Examples
 4 192.168.0.1
 5 192.168.0.1/24
 8 192.168.0.1 255.255.255.0
 */
var IPv4 = (function () {
    function IPv4() {
        this.originalAddress = 0;
        this.networkAddress = 0;
        this.broadcastAddress = 0;
        this.subnetMask = 0;
        this.cidr = 0;
    }
    IPv4.padding = function (bin, pad, dir, diff) {
        for (var i = 0; i < diff; i++) {
            switch (dir) {
                case 0:
                    bin = pad + bin;
                    break;
                case 1:
                    bin = bin + pad;
                    break;
            }
        }
        return bin;
    };
    IPv4.octet = function (text) {
        var dec = parseInt(text), bin = dec.toString(2);
        if (text === '' || dec < 0 || dec > 255) {
            throw new SyntaxError('out of range');
        }
        bin = IPv4.padding(bin, '0', 0, 8 - bin.length);
        return bin;
    };
    IPv4.tetco = function (text) {
        var dec = parseInt(text, 2);
        if (text === '' || dec < 0 || dec > 255) {
            throw new SyntaxError('out of range');
        }
        return dec;
    };
    IPv4.dot2dec = function (dot) {
        var bin = '', dec;
        for (var i = 0; i < 4; i++) {
            bin = bin + IPv4.octet(dot[i]);
        }
        dec = parseInt(bin, 2) >>> 0;
        return dec;
    };
    IPv4.dec2dot = function (decimal, binary) {
        var dot = [], bin = decimal.toString(2);
        bin = IPv4.padding(bin, '0', 0, 32 - bin.length);
        for (var i = 0; i < 4; i++) {
            if (!binary) {
                dot[i] = IPv4.tetco(bin.substr(8 * i, 8));
            }
            else {
                dot[i] = bin.substr(8 * i, 8);
            }
        }
        return dot.join('.');
    };
    IPv4.cidr2dec = function (cidr) {
        var bin = '', dec;
        if (cidr < 0 || cidr > 32) {
            throw new SyntaxError('out of range (CIDR)');
        }
        for (var i = 0; i < 32; i++) {
            if (i < cidr) {
                bin = bin + '1';
            }
            else {
                bin = bin + '0';
            }
        }
        dec = parseInt(bin, 2) >>> 0;
        return dec;
    };
    IPv4.dec2cidr = function (decimal) {
        var cidr = 0, bin = decimal.toString(2), border = false;
        bin = IPv4.padding(bin, '0', 0, 32 - bin.length);
        for (var i = 0; i < 32; i++) {
            if (bin[i] == '1' && !border) {
                cidr++;
            }
            else if (bin[i] == '0') {
                border = true;
            }
            else {
                throw new SyntaxError('invalid subnet mask');
            }
        }
        return cidr;
    };
    IPv4.prototype.parseText = function (text) {
        var octets = text.replace(/(\.|\/| )/g, '.').split('.');
        console.log(octets);
        switch (octets.length) {
            case 4:
                break;
            case 5:
                this.cidr = parseInt(octets[4]);
                this.subnetMask = IPv4.cidr2dec(this.cidr);
                break;
            case 8:
                this.subnetMask = IPv4.dot2dec(octets.slice(4, 8));
                this.cidr = IPv4.dec2cidr(this.subnetMask);
                break;
            default:
                throw new SyntaxError('unknown syntax');
                break;
        }
        this.originalAddress = IPv4.dot2dec(octets.slice(0, 4));
        this.networkAddress = (this.subnetMask & this.originalAddress) >>> 0;
        this.broadcastAddress = (~this.subnetMask | this.originalAddress) >>> 0;
    };
    IPv4.prototype.getOriginalAddress = function (binary) {
        return IPv4.dec2dot(this.originalAddress, binary);
    };
    IPv4.prototype.getNetworkAddress = function (binary) {
        return IPv4.dec2dot(this.networkAddress, binary);
    };
    IPv4.prototype.getBroadcastAddress = function (binary) {
        return IPv4.dec2dot(this.broadcastAddress, binary);
    };
    IPv4.prototype.getSubnetMask = function (binary) {
        return IPv4.dec2dot(this.subnetMask, binary);
    };
    IPv4.prototype.getHostsRange = function (binary) {
        if (this.cidr <= 30) {
            return IPv4.dec2dot(this.networkAddress + 1, binary) + ' ~ ' + IPv4.dec2dot(this.broadcastAddress - 1, binary);
        }
        else {
            return '-';
        }
    };
    IPv4.prototype.getAddressClass = function () {
        return "unimplemented";
    };
    IPv4.prototype.getHostsCount = function () {
        if (this.cidr <= 30) {
            return this.broadcastAddress - this.networkAddress - 1;
        }
        else {
            return 0;
        }
    };
    IPv4.prototype.getCIDR = function () {
        return this.cidr;
    };
    return IPv4;
})();
//# sourceMappingURL=ipv4calc.js.map