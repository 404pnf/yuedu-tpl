
var T = {};
// > undefined

(function () {
  var s = 'a'
  T.s = 'a';
  T;
})();
// > undefined

T.s
// > 'a'

