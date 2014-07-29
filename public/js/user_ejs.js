


// function used for side-effect only
// changing text in html
var renderData = function(url, tpl, cssID) {
  $.get(url, function(data) {
    new EJS({url: tpl}).update(cssID, data);
  });
};

var userShow = function() {
  renderData('/user/1/show',
             'tpl/user_show.ejs',
             'user_info');
};

// var userEdit = renderData( '/user/1/show',
//                            'tpl/user_edit.ejs',
//                            'user_info');

// YD.userEdit = new EJS({url: 'tpl/user_edit.ejs'}).update('#user_info', '/user/1/show');
// YD.userPhoto = new EJS({url: 'tpl/user_photo.ejs'}).update('user_photo', '/user/photos');
// YD.userPhotoShow = new EJS({url: 'tpl/user_photo_edit.ejs'}).update('user_photo', '/user/photos');

$(document).ready(function() {
  userShow();
  // $('#edit_user_info').click(function() {
  //   userEdit();
  // });
  $('#msg').html('status msg');
});
