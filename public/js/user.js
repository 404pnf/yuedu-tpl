var Y;
var user;
$.getJSON("http://0.0.0.0:4567/user/1/show", function(json) {
  user = json;
  new EJS({url: 'tpl/user_show.ejs'}).update('bf', user);
});

$(document).ready(function() {
  //$('#user-edit').css('background-color', 'red');
});

$(document).ready(function() {
  $('#edit-user-info').click(function() {
    $('#user-show').hide();
  });
});

// Y.showUserInfo = function () {
//   $(document).ready(function() {
//   $('#user-info').show();
//   });
// };

// Y.hideUserEdit = function () {
//   $(document).ready(function() {
//     $('#user-edit').hide();
//   });
// };

// Y.showUserEdit = function () {
//   $(document).ready(function() {
//   $('#user-edit').show();
//   });
// };

// $(document).ready(function() {
//   $('#edit-user-info').click(function() {
//     Y.hideUserInfo();
//     Y.showUserEdit();
//   })
// });
