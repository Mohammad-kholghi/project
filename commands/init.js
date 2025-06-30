const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const yaml = require('yaml');
const { sshExec } = require('../lib/exec');

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
  
    const buildYamlContent = await fs.promises.readFile(build, 'utf8');
    const buildYamlContentParsed = yaml.parse(buildYamlContent);
    // console.log(buildYamlContentParsed);

    for (const setup of buildYamlContentParsed.setup) {
        console.log(setup);
        if (setup.command) {
            // TODO: run the command on the instance
            await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `${setup.command}`).then(() => {
                console.log('done');
            });
        }
        else if (setup.apt) {
            // TODO: run the apt command on the instance to install the packages
            // run a command over ssh:
            await sshExec('ubuntu', '37.32.9.61', path.join(homedir, '/.ssh/id_rsa'), `sudo apt install ${setup.apt} -y`).then(() => {
                console.log('done');
            });
        }
        else if (setup.git) {
            // TODO: clone the git repo on the instance
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