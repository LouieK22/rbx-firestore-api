import { HttpService } from "@rbxts/services";
import { Firestore } from "Firestore";
import { DocumentSnapshot } from "DocumentSnapshot";
import { RawFirestoreDocument, DocumentData, encodeDocumentFields } from "util/documentFields";
import inspect from "@rbxts/inspect";

export class DocumentReference {
	public path: string;

	private firestore: Firestore;

	public constructor(firestore: Firestore, path: string) {
		this.firestore = firestore;
		this.path = path;
	}

	public async get() {
		const stat = await this.firestore.tokenManager.fetch({
			Url: `${this.firestore.baseUrl}/documents/${this.path}`,
		});

		if (stat.success) {
			return this.parseResponse(stat.value);
		} else {
			throw stat.error;
		}
	}

	public async set(data: DocumentData) {
		const encodingStat = opcall(() => {
			return HttpService.JSONEncode({
				fields: encodeDocumentFields(data),
			});
		});

		if (!encodingStat.success) {
			throw "data encoding failed\n" + encodingStat.error;
		}

		print(inspect(encodingStat.value));

		const stat = await this.firestore.tokenManager.fetch({
			Url: `${this.firestore.baseUrl}/documents/${this.path}`,
			Method: "PATCH",
			Body: encodingStat.value,
		});

		print(inspect(stat));

		if (stat.success) {
			return this.parseResponse(stat.value);
		} else {
			throw stat.error;
		}
	}

	public async delete() {
		const stat = await this.firestore.tokenManager.fetch({
			Url: `${this.firestore.baseUrl}/documents/${this.path}`,
			Method: "DELETE",
		});

		if (stat.success) {
			return true;
		} else {
			throw false;
		}
	}

	private parseResponse(response: RequestAsyncResponse) {
		const jsonStat = opcall(() => {
			return HttpService.JSONDecode(response.Body);
		});

		if (response.Success && jsonStat.success) {
			return new DocumentSnapshot(this, jsonStat.value as RawFirestoreDocument);
		} else {
			return new DocumentSnapshot(this);
		}
	}
}
