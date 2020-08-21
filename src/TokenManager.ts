import { HttpService } from "@rbxts/services";
import { Firestore } from "Firestore";

export class TokenManager {
	private firestore: Firestore;
	private currentToken?: string;
	private tokenExpires = 0;

	public constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	public async getToken() {
		if (!this.tokenValid()) {
			await this.refreshToken();
		}

		if (this.currentToken !== undefined) {
			return this.currentToken;
		} else {
			throw "no token";
		}
	}

	public tokenValid() {
		return this.currentToken !== undefined && os.time() < this.tokenExpires;
	}

	public async fetch(request: RequestAsyncRequest) {
		if (request.Headers === undefined) {
			request.Headers = {};
		}

		if (request.Body !== undefined) {
			request.Headers["Content-Type"] = "application/json";
		}

		const token = await this.getToken();
		request.Headers["Authorization"] = `Bearer ${token}`;

		return opcall(() => {
			return HttpService.RequestAsync(request);
		});
	}

	private async refreshToken() {
		const stat = opcall(() => {
			return HttpService.RequestAsync({
				Url: this.firestore.config.keyServer.url,
				Headers: {
					Authentication: this.firestore.config.keyServer.key,
				},
			});
		});

		if (!stat.success) {
			throw stat.error;
		}

		const res = stat.value;
		if (!res.Success) {
			throw res.Body;
		}

		this.currentToken = res.Body;
		this.tokenExpires = os.time() + 3500;
	}
}
