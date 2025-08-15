const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
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
	// console.log(buildYamlContentParsed);
	console.log(buildYamlContentParsed.jobs.build);
	
	
	if(job == "build"){
		
	}
	
	
	if (job == buildYamlContentParsed.jobs.build) {
		console.log(job);
	} else {
		console.log(job);
		console.log(buildYamlContentParsed.jobs);
		console.log("not")
	}
	
	for (const job of buildYamlContentParsed.jobs) {
		console.log(job);
		if (job.build) {
			// TODO: run the command on the instance
			await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `${job.command}`).then(() => {
				console.log('done');
			});
		}
		else if (job.apt) {
			// TODO: run the apt command on the instance to install the packages
			await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `sudo apt install -y ${job.apt}`).then(() => {
				console.log('done');
			});
		}
		else if (job.git) {
			// TODO: clone the git repo on the instance
			await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `git clone ${job.git}`).then(() => {
				console.log('done');
			});
		}
		else if (job.playbook) {
			// TODO: run the ansible playbook on the instance
		}
		else {
			console.error('unknown setup command');
		}
	}
};
