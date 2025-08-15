const endpoint = 'https://napi.arvancloud.ir/ecc/v1';
require('dotenv').config();

class ArvanProvider {
	constructor(config = { token }) {
		this.config = config;
	}
	
	async listRegions() {
		// TODO 3: Get a list of regions
		try {
			const response = await fetch(`${endpoint}/regions`, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				}
			});
			
			if (!response.ok) {
				throw new Error(`Failed to get regions: ${response.status} ${response.statusText}`);
			}
			
			let result = await response.json();
			
			return result.data;
		} catch (error) {
			console.log('Failed to get regions', error.message);
			throw error;
		}
	}

	async listImages(region) {
		// TODO 4: Get a list of images
		try {
			const response = await fetch(`${endpoint}/regions/${region}/images?type=distributions`, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				}
			});
			
			if (!response.ok) {
				throw new Error(`Failed to get images: ${response.status} ${response.statusText}`);
			}
			
			return await response.json().data;
		} catch (error) {
			console.log('Failed to get images', error.message);
			throw error;
		}
	}

	async listSizes(region) {
		// TODO 5: Get a list of sizes
		try {
			const response = await fetch(`${endpoint}/regions/${region}/sizes`, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to get sizes: ${response.status} ${response.statusText}`);
			}
			
			const result = await response.json();
			return result.data;
			
		} catch (error) {
			console.log('Failed to get sizes', error.message);
			throw error;
		}
	}
	
	async listInstances(region) {
		try {
			const response = await fetch(`${endpoint}/regions/${region}/servers`, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				}
			});
			
			if (!response.ok) {
				throw new Error(`Failed to get Instances: ${response.status} ${response.statusText}`);
			}
						
			return (await response.json()).data;
		} catch (error) {
			console.log('Failed to get Instances', error.message);
			throw error;
		}
	}
	
	async create(options) {
		
		// TODO 6: Create a server
		let { name, region, size, image } = options;
		
		let response, result;
		
		try {
			
			
			response = await fetch(`${endpoint}/regions/${region}/servers`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				},
				body: JSON.stringify({
					name: name,
					image_id: image,
					flavor_id: size,
					disk_size: 25,
					ssh_key: true,
					ssh_keys: ["testtt"],
					enable_ipv4: true
				})
			});
			
			if (!response.ok) {
				const errorBody = await response.text();
				throw new Error(`Failed to create server: ${response.status} ${response.statusText}\nDetails: ${errorBody}`);
			}
			
			result = await response.json();
			
			console.log("--------------------------------------------------------");
			console.log(result);
			console.log("--------------------------------------------------------");
			
			let backUpPassword = result.data.password;
			let serverID = result.data.id;
			
			// TODO 7: Wait for server to be ready, then get its IP and print it
			
			for (let i = 1; i <= 20; i++) {
				
				console.log(`Try ${i}, waiting ${5} seconds...`);
				await this.sleep(5 * 1000);
				
				console.log("checking if server is ready...");
				
				try {
					// response = await fetch(`${endpoint}/regions/${region}/servers/0ee258f4-fa4d-4144-b305-441aeda65e8c`, {
					response = await fetch(`${endpoint}/regions/${region}/servers/${serverID}`, {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Apikey ${this.config.token}`,
						}
					});
					
					if (!response.ok) {
						const errorBody = await response.text();
						throw new Error(`Failed to get details: Network Error. ${response.status} ${response.statusText}\n Details: ${errorBody}`);
					}
					
					result = await response.json();
					console.log(response);
					
					console.log("--------------------------------------------------------");
					console.log(result);
					console.log("--------------------------------------------------------");
					
					console.log("ip: " + result.data.security_groups[0].ip_addresses[0]);
					console.log("status: " + result.data.status);
					
					if (result.data.status === 'ACTIVE') {
						console.log("--------------------------------------------------------");
						console.log(result);
						console.log("--------------------------------------------------------");
						console.log(`IP: ${result.data.security_groups[0].ip_addresses[0]}`);
						break;
					}
					
					if (i == 20){
						throw new Error('Server timeout');
					}
					
				} catch (error) {
					throw error;
				}
			}
			
			result.data.password = backUpPassword;
			
			return result;
			
		} catch (error) {
			throw error;
		}
		
		
		// TODO 8: Update your implementation to set the ssh key for the server when it's created. Add all the ssh keys in your account to the server.
		
	}

	
	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	async delete(region, serverId) {
		// Destroy a server
		// TODO: 9: delete the server
		console.log(`${endpoint}/regions/${region}/servers/${serverId}`);
		
		try {
			const response = await fetch(`${endpoint}/regions/${region}/servers/${serverId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Apikey ${this.config.token}`,
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to delete server: ${response.status} ${response.statusText}`);
			}

			let result = await response.json();
			console.log(result);
			
			return result;
			
		} catch (error) {
			console.log('Failed to delete server', error.message);
			throw error;
		}
	}
}

module.exports = ArvanProvider;