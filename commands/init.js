const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const yaml = require('yaml');
const { sshExec } = require('../lib/exec');
const ArvanProvider = require('../lib/arvan');


exports.command = ['init'];
exports.desc = 'list the regions available to you';

exports.builder = yargs => {
	yargs.example('$0 init --build=build.yaml', 'provision and setup the build environment using the setup section of given build.yaml file');

	yargs.options({
		build: {
			describe: 'the path to the build.yaml file',
			demand: true,
			type: 'string',
			alias: 'b',
		}
	});
};

exports.handler = async argv => {
	let { build } = argv;

	// TODO: create a new instance
	// hint: you should store an inventory file when you create the instance. 
	//       that way your ansible roles can use the inventory file to run against the instance you just created

	// USE LOCAL SERVER?
	let useLocal = process.env.USE_LOCAL === "true";
	
	// SERVER INFO
	let sshServer, sshUser;
	let sshKey = path.join(homedir, process.env.SSH_KEY);
	
	if(useLocal){
		sshServer = process.env.LOCAL_SERVER;
		sshUser = process.env.LOCAL_USER;
	} else {
		
		const p = new ArvanProvider({ token: process.env.ARVAN_TOKEN });
		console.log('Provisioning...');
		
		const result = await p.create({
			'name': process.env.SERVER_NAME,
			'region': process.env.SERVER_REGION,
			'size': process.env.SERVER_SIZE,
			'image': process.env.SERVER_IMAGE
		});
		
		// TODO 6: next wait for the VM to be ready and then get and print its IP address
		console.log(`Server ID: ${result.data.id} , IP Address: ${result.data.security_groups[0].ip_addresses[0]}`);
		console.log(`${result.data.password}`);
		
		console.log('Done!');
		
		sshUser = 'ubuntu';
		sshServer = result.data.security_groups[0].ip_addresses[0];
	}
	
	const buildYamlContent = await fs.promises.readFile(build, 'utf8');
	const buildYamlContentParsed = yaml.parse(buildYamlContent);

	for (const setup of buildYamlContentParsed.setup) {
		
		console.log("current setup: ");
		console.log(setup)
		
		if (setup.command) {
			// TODO: run the command on the instance
			await sshExec(sshUser, sshServer, sshKey, `${setup.command}`).then(() => {
				console.log(`${setup.command} done`);
			});
		}
		else if (setup.apt) {
			// TODO: run the apt command on the instance to install the packages
			await sshExec(sshUser, sshServer, sshKey, `sudo apt install -y ${setup.apt}`).then(() => {
				console.log(`Installing ${setup.apt} done`);
			});
		}
		else if (setup.git) {
			// TODO: clone the git repo on the instance
			await sshExec(sshUser, sshServer, sshKey, `git clone ${setup.git}`).then(() => {
				console.log(`cloning ${setup.git} done`);
			});
		}
		else if (setup.playbook) {
			// TODO: run the ansible playbook on the instance
		}
		else {
			console.error('unknown setup command');
		}
	}
};
