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

class IPv4 {
    private originalAddress:number = 0;
    private networkAddress:number = 0;
    private broadcastAddress:number = 0;
    private subnetMask:number = 0;
    private cidr:number = 0;

    private static padding(bin:string, pad:string, dir:number, diff:number):string {
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
    }

    private static octet(text:string):string {
        var dec = parseInt(text), bin = dec.toString(2);

        if (text === '' || dec < 0 || dec > 255) {
            throw new SyntaxError('out of range');
        }

        bin = IPv4.padding(bin, '0', 0, 8 - bin.length);

        return bin;
    }

    private static tetco(text:string):number {
        var dec = parseInt(text, 2);

        if (text === '' || dec < 0 || dec > 255) {
            throw new SyntaxError('out of range');
        }

        return dec;
    }

    private static dot2dec(dot:string[]):number {
        var bin = '', dec;

        for (var i = 0; i < 4; i++) {
            bin = bin + IPv4.octet(dot[i]);
        }

        dec = parseInt(bin, 2) >>> 0;

        return dec;
    }

    private static dec2dot(decimal:number, binary:boolean):string {
        var dot = [], bin = decimal.toString(2);

        bin = IPv4.padding(bin, '0', 0, 32 - bin.length);

        for (var i = 0; i < 4; i++) {
            if (!binary) {
                dot[i] = IPv4.tetco(bin.substr(8 * i, 8));
            } else {
                dot[i] = bin.substr(8 * i, 8);
            }
        }

        return dot.join('.');
    }

    private static cidr2dec(cidr:number):number {
        var bin = '', dec;

        if (cidr < 0 || cidr > 32) {
            throw new SyntaxError('out of range (CIDR)');
        }

        for (var i = 0; i < 32; i++) {
            if (i < cidr) {
                bin = bin + '1';
            } else {
                bin = bin + '0';
            }
        }

        dec = parseInt(bin, 2) >>> 0;

        return dec;
    }

    private static dec2cidr(decimal:number):number {
        var cidr = 0, bin = decimal.toString(2), border = false;

        bin = IPv4.padding(bin, '0', 0, 32 - bin.length);

        for (var i = 0; i < 32; i++) {
            if (bin[i] == '1' && !border) {
                cidr++;
            } else if (bin[i] == '0') {
                border = true;
            } else {
                throw new SyntaxError('invalid subnet mask');
            }
        }

        return cidr;
    }

    public parseText(text:string) {
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
    }

    public getOriginalAddress(binary:boolean):string {
        return IPv4.dec2dot(this.originalAddress, binary);
    }

    public getNetworkAddress(binary:boolean):string {
        return IPv4.dec2dot(this.networkAddress, binary);
    }

    public getBroadcastAddress(binary:boolean):string {
        return IPv4.dec2dot(this.broadcastAddress, binary);
    }

    public getSubnetMask(binary:boolean):string {
        return IPv4.dec2dot(this.subnetMask, binary);
    }

    public getHostsRange(binary:boolean):string {
        if (this.cidr <= 30) {
            return IPv4.dec2dot(this.networkAddress + 1, binary) + ' ~ ' + IPv4.dec2dot(this.broadcastAddress - 1, binary);
        } else {
            return '-';
        }
    }

    public getAddressClass():string {
        return "unimplemented";
    }

    public getHostsCount():number {
        if (this.cidr <= 30) {
            return this.broadcastAddress - this.networkAddress - 1;
        } else {
            return 0;
        }
    }

    public getCIDR():number {
        return this.cidr;
    }
}