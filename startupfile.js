const {exec} = require('child_process');

exec('npm run build && npm run start',function (err,stdout,stderr){
	if(err){
		console.error("Error occurred: ",err);
	}
	
	if(stderr){
		console.log("the stderr is: ",stderr);
	}
	console.log("stdout is: ",stdout);
});
