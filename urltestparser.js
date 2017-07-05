function URLTestParser(input) {
  var relativeSchemes = ['ftp', 'file', 'gopher', 'http', 'https', 'ws', 'wss'];
  var tokenMap = {
    '\\': '\\',
    n: '\n',
    r: '\r',
    s: ' ',
    t: '\t',
    f: '\f'
  };
  var resultMap = {
    s: 'scheme',
    u: 'username',
    pass: 'password',
    h: 'host',
    port: 'port',
    p: 'path',
    q: 'query',
    f: 'fragment',
    o: 'origin'
  };
  var results = [];

  function Test() {
    this.input = '';
    this.base = '';
    this.scheme = '';
    this.username = '';
    this.password = null;
    this.host = '';
    this.port = '';
    this.path = '';
    this.query = '';
    this.fragment = '';
    this.origin = '';
    Object.defineProperties(this, {
      href: {
        get: function() {
          if (!this.scheme) {
            return this.input;
          }
          var result = this.protocol;
          if (relativeSchemes.indexOf(this.scheme) !== -1) {
            result += '//';
            if (this.username !== '' || this.password !== null) {
              result += this.username;
              if (this.password !== null) {
                result += ':' + this.password;
              }
              result += '@';
            }
            result += this.host;
          }
          if (this.port) {
            result += ':' + this.port;
          }
          result += this.path + this.query + this.fragment;
          return result;
        }
      },
      protocol: {
        get: function() {
          return this.scheme + ':';
        }
      },
      search: {
        get: function() {
          return '?' === this.query ? '' : this.query;
        }
      },
      hash: {
        get: function() {
          return '#' === this.fragment ? '' : this.fragment;
        }
      }
    });
  }

  function normalize(input) {
    var output = '';
    for (var i = 0, l = input.length; i < l; i++) {
      var c = input[i];
      if (c === '\\') {
        var nextC = input[++i];
        if (tokenMap.hasOwnProperty(nextC)) {
          output += tokenMap[nextC];
        } else if (nextC === 'u') {
          var _inp = input[++i] + input[++i] + input[++i] + input[++i];
          output += String.fromCharCode(parseInt(_inp, 16));
        } else {
          throw new Error('Input is invalid.');
        }
      } else {
        output += c;
      }
    }
    return output;
  }
  var lines = input.split('\n');
  for (var i = 0, l = lines.length; i < l; i++) {
    var line = lines[i];
    if (line === '' || line.indexOf('#', 0) === 0) {
      continue;
    }
    var pieces = line.split(' ');
    var result = new Test();
    result.input = normalize(pieces.shift());
    var base = pieces.shift();
    if (base === '' || base === undefined) {
      result.base = results[results.length - 1].base;
    } else {
      result.base = normalize(base);
    }
    for (var ii = 0, ll = pieces.length; ii < ll; ii++) {
      var piece = pieces[ii];
      if (piece.indexOf('#', 0) === 0) {
        continue;
      }
      var subpieces = piece.split(':');
      var token = subpieces.shift();
      var value = subpieces.join(':');
      result[resultMap[token]] = normalize(value);
    }
    results.push(result);
  }
  return results;
}
