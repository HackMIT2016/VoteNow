$(function() {

	alert('hello');

	$('#testbtn').click(function() {
		changeClass($(this),'default','highlight')
	});

});
var changeClass = function(button,class1,class2){
	if(button.hasClass(class1)){
		$(button).removeClass(class1)
		$(button).addClass(class2)
	}
	else{
		$(button).removeClass(class2)
		$(button).addClass(class2)
	}	
}

