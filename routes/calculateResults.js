module.exports = function(votes, questions) {

    var results=[]

    for (var question in questions){
    	if (questions.hasOwnProperty(question)){
    		if (question.type=="majority"){
	    		var candidateCounts={}
	    		for (var cand in question.candidates){
	    			if (question.candidates.hasOwnProperty(cand)) {
	    				candidateCounts[cand]=0
	    			}
	    		}
	    		for (var vote in votes) {
	    			if (votes.hasOwnProperty(vote)) {
	    				choice=vote.questionMap[question]
	    				candidateCounts[choice]+=1
	    			}
	    		}
	    	}
	    }
	    question.candidates.sort(function(a, b) {
	    	return candidateCounts[a] > candidateCounts[b];
	    });

	    qResult=[]
	    for (var cand in question.candidates){
	    	if (question.candidates.hasOwnProperty(cand)){
	    		qResult.push([cand, candidateCounts[cand]])
	    	}
	    }
	    results.push(qResult)
	}
    
    return results;
    
};
