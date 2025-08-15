const ArvanProvider = require('../lib/arvan');

exports.command = ['provision'];
exports.desc = 'list the regions available to you';

exports.builder = yargs => {
	yargs.example('$0 provision --provider do --name myvm --region nyc1 --size s-1vcpu-1gb --image ubuntu-18-04-x64');
	yargs.example('$0 provision --provider aws --name myvm --region us-east-1 --size t2.micro --image ami-0c55b159cbfafe1f0');

	yargs.options({
		provider: {
			describe: 'Set the cloud-instance provider to use',
			demand: false,
			type: 'string',
			default: 'arvan'
		},
		name: {
			describe: 'The name of the VM to create',
			demand: false,
			type: 'string',
			default: 'default'
		},
		region: {
			describe: 'The region to create the VM in',
			demand: false,
			type: 'string',
			default: 'ir-thr-ba1'
		},
		size: {
			describe: 'The size of the VM to create',
			demand: false,
			type: 'string',
			default: 'eco-1-1-0'
		},
		image: {
			describe: 'The image to use for the VM',
			demand: false,
			type: 'string',
			default: '793cdb82-c731-4aeb-808d-19da98525a02'
		}
	});
};

exports.handler = async argv => {
	let { provider, name, region, size, image } = argv;

	try {

		let p;
		if (provider === 'arvan') {
			p = new ArvanProvider({ token: process.env.ARVAN_TOKEN });
		} else {
			throw new Error(`The provider ${provider} is not supported yet.`);
		}

		// TODO 5: create a new VM using the DigitalOcean provider, and give it a name, region, size, and image

		console.log('Provisioning...');
		const result = await p.create({
			'name': name,
			'region': region,
			'size': size,
			'image': image
		});
		
		// TODO 6: next wait for the VM to be ready and then get and print its IP address
		console.log(`Server ID: ${result.data.id} , IP Address: ${result.data.security_groups[0].ip_addresses[0]}`);

		console.log('Done!');
	} catch (error) {
		console.log(error.message);
	}
};
