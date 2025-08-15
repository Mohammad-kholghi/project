const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const yaml = require('yaml');
const { sshExec } = require('../lib/exec');
const ArvanProvider = require('../lib/arvan');
const Cmd = require('../lib/Commands');


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

	let p = new ArvanProvider({ token: process.env.ARVAN_TOKEN });
	
	console.log('Provisioning...');
	
	const result = await p.create({
		'name': "testserver",
		'region': 'ir-thr-ba1',
		'size': 'eco-1-1-0',
		'image': '793cdb82-c731-4aeb-808d-19da98525a02'
	});

	// TODO 6: next wait for the VM to be ready and then get and print its IP address
	console.log(`Server ID: ${result.data.id} , IP Address: ${result.data.security_groups[0].ip_addresses[0]}`);
	console.log(`${result.data.password}`);

	console.log('Done!');
	
	
	
	let server = result.data.security_groups[0].ip_addresses[0];
	
	// return;
	
	
	const buildYamlContent = await fs.promises.readFile(build, 'utf8');
	const buildYamlContentParsed = yaml.parse(buildYamlContent);
	// console.log(buildYamlContentParsed);
	
	let cmd = new Cmd(server, 'ubuntu', path.join(homedir, '/.ssh/id_rsa'));
	
	

	for (const setup of buildYamlContentParsed.setup) {
		console.log(setup);
		if (setup.command) {
			// TODO: run the command on the instance
			//???????????????????????????
			await cmd.git(setup.cpmmand).then(() => {
				console.log(`installed apt ${setup.command}`)
			});
			
			// await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `${setup.command}`).then(() => {
			// 	console.log('done');
			// });
		}
		else if (setup.apt) {
			// TODO: run the apt command on the instance to install the packages
			await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `sudo apt install -y ${setup.apt}`).then(() => {
				console.log('done');
			});
		}
		else if (setup.git) {
			// TODO: clone the git repo on the instance
			await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `git clone ${setup.git}`).then(() => {
				console.log('done');
			});
		}
		else if (setup.playbook) {
			// TODO: run the ansible playbook on the instance
		}
		else {
			console.error('unknown setup command');
		}
	}


	// run a command over ssh:
	// sshExec('USERNAME', 'IP_ADDRESS', path.join(homedir, '/.ssh/id_rsa'), 'ls -al').then(() => {
	//     console.log('done');
	// });

};
