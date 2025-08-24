const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const homedir = require('os').homedir();
const { sshExec } = require('../lib/exec');
const { runPlaybook } = require('../lib/exec');

exports.command = ['build'];
exports.desc = 'run a build based on the configuration given in the build.yaml file';

exports.builder = yargs => {
	yargs.example('$0 build --job=build --build=build.yaml', 'run the job with the name "build" using the build.yaml file');

	yargs.options({
		job: {
			describe: 'name of the job to run',
			demand: true,
			type: 'string'
		},
		build: {
			describe: 'the path to the build.yaml file',
			demand: true,
			type: 'string',
			alias: 'b',
		}
	});
};

exports.handler = async argv => {
	let { job, build } = argv;
	// TODO: create a new instance
	// hint: you should store an inventory file when you create the instance. 
	//       that way your ansible roles can use the inventory file to run against the instance you just created
	
	const buildYamlContent = await fs.promises.readFile(build, 'utf8');
	const buildYamlContentParsed = yaml.parse(buildYamlContent);
	
	// SERVER INFO
	let sshServer =  process.env.LOCAL_SERVER;
	let sshUser = process.env.LOCAL_USER;
	let sshKey = path.join(homedir, process.env.SSH_KEY);
	
	const jobToRun = 'build';
	
	for (const step of buildYamlContentParsed.jobs[jobToRun]) {
		if (step.command) {
			console.log(step.command)
			
			let command = '';
			
			
			if(step.env){
				command = `export ${step.env} && `
			}
			
			command += step.command;
			console.log(command)
			
			await sshExec(sshUser, sshServer, sshKey, `${command}`).then(() => {
				console.log(`${command} done`);
				console.log("---------------------------------------------------------------\n\n")
			});
		}
	}
	
	return;
};
