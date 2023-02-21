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

};
