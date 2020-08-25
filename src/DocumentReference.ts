import { HttpService } from "@rbxts/services";
import { DocumentSnapshot } from "DocumentSnapshot";
import { Firestore } from "Firestore";
import * as References from "References";
import { DocumentData, encodeDocumentFields, RawFirestoreDocument } from "util/documentFields";
import { cleanPath, pathJoin } from "util/path";

/**
 * Represents a Document in a Firestore
 * A [[DocumentReference]] does not gaurantee a Document exists
 */
export class DocumentReference {
	/**
	 * Document path
	 */
	public path: string;

	/**
	 * [[Firestore]] to which the Document belongs
	 */
	private firestore: Firestore;

	public constructor(firestore: Firestore, path: string) {
		this.firestore = firestore;
		this.path = cleanPath(path);
	}

	/**
	 * Get a subcollection of the document
	 * @param path Path to subcollection
	 */
	public collection(path: string) {
		return new References.CollectionReference(this.firestore, pathJoin(this.path, path));
	}

	/**
	 * Read the Document from Firestore
	 */
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

	/**
	 * Updates the document in Firestore
	 * Creates the document if it does not exist
	 *
	 * @param data Data for the document
	 */
	public async set(data: DocumentData) {
		const encodingStat = opcall(() => {
			return HttpService.JSONEncode({
				fields: encodeDocumentFields(data),
			});
		});

		if (!encodingStat.success) {
			throw "data encoding failed\n" + encodingStat.error;
		}

		const stat = await this.firestore.tokenManager.fetch({
			Url: `${this.firestore.baseUrl}/documents/${this.path}`,
			Method: "PATCH",
			Body: encodingStat.value,
		});

		if (stat.success) {
			return this.parseResponse(stat.value);
		} else {
			throw stat.error;
		}
	}

	/**
	 * Deletes a Document from Firestore
	 */
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

	/**
	 * Decodes a JSON-formatted response into a [[DocumentSnapshot]]
	 *
	 * @param response JSON-formatted response
	 */
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
