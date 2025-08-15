
const { sshExec } = require('./exec');


class Commands {


	constructor(server, user, sshKey) {
		this.server = server;
		this.user = user,
			this.id_rsa = sshKey;
	}


	static async apt(what) {
		await sshExec(user, server, sshKey, `sudo apt install -y ${what}`).then(() => {
			console.log('done');
		});
	}


	command() {

	}

	git() {

	}

	env() {

	}

}

module.exports = Commands;