$(function() {

	alert('hello');

	$('#testbtn').click(function() {
		changeClass($(this),'default','highlight')
	});

	$('#addButton').click(function(e) {
		e.preventDefault();
		alert('hi');
	});

	addQuestion();
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

var count=0
function addQuestion(){
	count++
	$("#questionContainer").append(
		"<h4> Position Title </h4>" +
		"<input type='text' name='question_'"+count+">"+
		"<h4> Candidates:</h4>"+
		"<textarea rows='4' cols='50' name='questionData_'"+count+" form='create_form'></textarea>")
}