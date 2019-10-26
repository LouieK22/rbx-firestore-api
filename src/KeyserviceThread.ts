import { FirestoreClient } from ".";
import { HttpService } from "@rbxts/services";

interface IKeyserviceResponseBody {
	token: string;
}

interface IOAuthResponseBody {
	access_token: string;
	expires_in: number;
	token_type: "Bearer";
}

export class KeyserviceThread {
	private client: FirestoreClient;

	private lastTokenUpdate = 0;
	private tokenLifetime = 0;

	public constructor(client: FirestoreClient) {
		this.client = client;

		const thread = this;

		spawn(() => {
			thread.workerThread();
		});
	}

	private updateToken() {
		let keyserviceRes;
		let oauthRes;

		try {
			keyserviceRes = HttpService.RequestAsync({
				Url: this.client.keyserviceUrl,
				Headers: {
					["rbx-auth"]: this.client.keyserviceKey,
				},
			});
		} catch (e) {
			throw "Keyservice update failed! Error: " + e;
		}

		if (!keyserviceRes.Success) {
			throw "Keyservice update failed! Error: " + keyserviceRes.Body;
		}

		const keyserviceBodyParsed = HttpService.JSONDecode(keyserviceRes.Body) as IKeyserviceResponseBody;

		try {
			oauthRes = HttpService.RequestAsync({
				Url: "https://www.googleapis.com/oauth2/v4/token",
				Method: "POST",
				Headers: {
					["Content-Type"]: "application/json",
				},
				Body: HttpService.JSONEncode({
					assertion: keyserviceBodyParsed.token,
					grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
				}),
			});
		} catch (e) {
			throw "OAuth update failed! Error: " + e;
		}

		if (!oauthRes.Success) {
			throw "OAuth update failed! Error: " + oauthRes.Body;
		}

		const oauthBodyParsed = HttpService.JSONDecode(oauthRes.Body) as IOAuthResponseBody;

		this.lastTokenUpdate = tick();
		this.tokenLifetime = oauthBodyParsed.expires_in;
		this.client.currentToken = oauthBodyParsed.access_token;
		this.client.tokenInvalid = false;
	}

	private workerThread() {
		for (;;) {
			if (this.lastTokenUpdate + this.tokenLifetime * 0.95 <= tick()) {
				this.client.tokenInvalid = true;
				this.updateToken();
			}

			wait(1);
		}
	}
}
