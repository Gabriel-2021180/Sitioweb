window.onload = function() {
    const errorMsg = document.body.dataset.errorMsg;
    if (errorMsg) {
      swal({
        title: "Error",
        text: errorMsg,
        icon: "error",
      });
    }
};