import { FirestoreClient } from ".";
import { DocumentReference } from "./DocumentReference";

export class CollectionReference {
	private client: FirestoreClient;

	public path: string;

	public constructor(client: FirestoreClient, collectionPath: string) {
		this.client = client;

		this.path = collectionPath;
	}

	public doc(documentPath: string) {
		return new DocumentReference(this.client, this.path + "/" + documentPath);
	}
}
