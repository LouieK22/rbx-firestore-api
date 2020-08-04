import { HttpService } from "@rbxts/services";
import { Firestore } from "Firestore";
import { DocumentSnapshot } from "DocumentSnapshot";
import { RawFirestoreDocument, DocumentData, encodeDocumentFields } from "util/documentFields";
import inspect from "@rbxts/inspect";

export class DocumentReference {
	public id: string;

	private firestore: Firestore;

	public constructor(firestore: Firestore, id: string) {
		this.firestore = firestore;
		this.id = id;
	}

	public async get() {
		const token = await this.firestore.tokenManager.getToken();

		const stat = opcall(() => {
			return HttpService.RequestAsync({
				Url: `${this.firestore.baseUrl}/documents/${this.id}`,
				Headers: {
					Authorization: `Bearer ${token}`,
				},
			});
		});

		if (stat.success) {
			const jsonStat = opcall(() => {
				return HttpService.JSONDecode(stat.value.Body);
			});

			if (stat.value.Success && jsonStat.success) {
				return new DocumentSnapshot(this, jsonStat.value as RawFirestoreDocument);
			} else {
				return new DocumentSnapshot(this);
			}
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

		const token = await this.firestore.tokenManager.getToken();

		const stat = opcall(() => {
			return HttpService.RequestAsync({
				Url: `${this.firestore.baseUrl}/documents/${this.id}`,
				Method: "PATCH",
				Headers: {
					Authorization: `Bearer ${token}`,
					["Content-Type"]: "application/json",
				},
				Body: encodingStat.value,
			});
		});

		if (stat.success) {
			const jsonStat = opcall(() => {
				return HttpService.JSONDecode(stat.value.Body);
			});

			if (stat.value.Success && jsonStat.success) {
				return new DocumentSnapshot(this, jsonStat.value as RawFirestoreDocument);
			} else {
				return new DocumentSnapshot(this);
			}
		} else {
			throw stat.error;
		}
	}
}
