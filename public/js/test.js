function userShow() {
  var r;
  $.get('/user/1/show', function(data) {
    $.get('tpl/user_show.mst', function(template) {
      r = Mustache.render(template, data);
      consle.log(r);
    });
  });
};
(function f(arg1, arg2){ console})(arg1,userShow())



var f = function() { return 42; };


// function userEdit() {
//   $('#edit_user_info').click(function() {
//     $('#user_show').hide();
//     $.get('/user/1/show', function(data) {
//       $.get('tpl/user_edit.mst', function(template) {
//         var rendered = Mustache.render(template, data);
//         $('#user_edit').html(rendered);
//         userSave();
//       });
//     });
//   });
// };

// function userSave() {
//   $('#save_user_info').click(function() {
//     var form_data = $('form').serializeJSON();
//     //alert(form_data);
//     $.ajax({
//       type: "POST",
//       url: "/user/save",
//       data: form_data,
//       error: function() {
//         $('#status').text('有错！').slideDown('slow');
//       },
//       success: function() {
//         $('#status').text('更新成功了');
//       },
//       complete: function() {
//         $('#status').text('complete');
//       }
//     });
//   });
// };

// function userPhotoShow() {
//   $.get('/user/1/show', function(data) {
//     $.get('tpl/user_photo.mst', function(template) {
//       var rendered = Mustache.render(template, data);
//       $('#user_photo').html(rendered);
//       userPhotoEdit();
//     });
//   });
// };

// function userPhotoEdit() {
//   $('#edit_user_photo').click(function() {
//     $('#user_photo').hide();
//     $.get('/user/photos', function(data) {
//       $.get('tpl/user_photo_edit.mst', function(template) {
//         var rendered = Mustache.render(template, data);
//         $('#user_photo_edit').html(rendered);
//         //userPhotoShow();
//       });
//     });
//   });
// };

// function userPhotoSave() {
//   $('#save_user_photo').click(function() {
//     var form_data = $('form').serializeJSON();
//     $('#status').text('i am here');
//     alert(form_data);
//     $.ajax({
//       type: "POST",
//       url: "/user/save",
//       data: form_data,
//       error: function() {
//         $('#status').text('有错！').slideDown('slow');
//       },
//       success: function() {
//         $('#status').text('更新成功了');
//       },
//       complete: function() { //错误和正确都执行
//         $('#status').text('complete').slideDown('slow');
//       }
//     });
//   });
// };

$(document).ready( userShow() );
// $(document).ready( userPhotoShow() );
// $(document).ready(function() {
//   //$('#status').text('i am here');
// });
