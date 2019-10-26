import { FirestoreClient } from ".";
import { HttpService } from "@rbxts/services";
import { DocumentSnapshot, IEncodedValue } from "./DocumentSnapshot";

export interface IRawDocument {
	name: string;
	fields: Map<string, IEncodedValue>;
	createTime: string;
	updateTime: string;
}

export class DocumentReference {
	private client: FirestoreClient;

	public path: string;

	public constructor(client: FirestoreClient, path: string) {
		this.client = client;
		this.path = path;
	}

	public static encodeValue(value: unknown): IEncodedValue {
		if (typeIs(value, "string")) {
			return {
				stringValue: value,
			};
		} else if (typeIs(value, "number")) {
			if (value === math.floor(value)) {
				return {
					integerValue: tostring(value),
				};
			} else {
				return {
					doubleValue: value,
				};
			}
		} else if (typeIs(value, "boolean")) {
			return {
				booleanValue: value,
			};
		} else if (typeIs(value, "table")) {
			const str = HttpService.JSONEncode(value);

			if (str.sub(0, 0) === "[") {
				const output = new Array<IEncodedValue>();

				value.forEach((element, index) => {
					output[index] = DocumentReference.encodeValue(element);
				});

				return {
					arrayValue: {
						values: output,
					},
				};
			} else {
				return {
					mapValue: {
						fields: DocumentReference.encodeFields(value as Map<string, unknown>),
					},
				};
			}
		} else {
			throw "Cannot encode value: " + tostring(value) + " of type " + typeOf(value);
		}
	}

	public static encodeFields(fields: Map<string, unknown>) {
		const output = new Map<string, IEncodedValue>();

		fields.forEach((value, key) => {
			const encodeValue = DocumentReference.encodeValue(value);

			output.set(key, encodeValue);
		});

		return output;
	}

	public async get() {
		let firestoreRes;
		try {
			firestoreRes = await this.client.requestQueue.request({
				Url: `${this.client.baseUrl}/documents/${this.path}`,
				Method: "GET",
			});
		} catch (e) {
			throw e as string;
		}

		if (firestoreRes.StatusCode === 200) {
			const data = HttpService.JSONDecode(firestoreRes.Body as string) as IRawDocument;

			return new DocumentSnapshot(this, data.fields);
		} else if (firestoreRes.StatusCode === 404) {
			return new DocumentSnapshot(this);
		} else {
			throw firestoreRes.Body;
		}
	}

	public async set(data: object) {
		let firestoreRes;
		try {
			firestoreRes = await this.client.requestQueue.request({
				Url: `${this.client.baseUrl}/documents/${this.path}`,
				Method: "PATCH",
				Body: HttpService.JSONEncode({
					fields: DocumentReference.encodeFields((data as unknown) as Map<string, unknown>),
				}),
			});
		} catch (e) {
			throw e as string;
		}

		if (firestoreRes.StatusCode === 200) {
			const resData = HttpService.JSONDecode(firestoreRes.Body);

			return new DocumentSnapshot(this, (resData as IRawDocument).fields);
		} else {
			throw firestoreRes.Body;
		}
	}

	public async delete() {
		let firestoreRes;
		try {
			firestoreRes = await this.client.requestQueue.request({
				Url: `${this.client.baseUrl}/documents/${this.path}`,
				Method: "DELETE",
			});
		} catch (e) {
			throw e as string;
		}

		if (firestoreRes.StatusCode === 200) {
			return;
		} else {
			throw firestoreRes.Body;
		}
	}
}
