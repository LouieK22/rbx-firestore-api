import { KeyserviceThread } from "./KeyserviceThread";
import { DocumentReference } from "./DocumentReference";
import { HttpQueue } from "./HttpQueue";
import { CollectionReference } from "./CollectionReference";

export interface IFirestoreConfig {
	project: string;

	keyserviceKey: string;
	keyserviceUrl: string;
}

export class FirestoreClient {
	public project: string;

	public keyserviceKey: string;
	public keyserviceUrl: string;
	public keyserviceThread: KeyserviceThread;

	public currentToken?: string;
	public tokenInvalid: boolean = true;

	public baseUrl: string;

	public requestQueue: HttpQueue;

	public constructor(config: IFirestoreConfig) {
		this.project = config.project;

		this.keyserviceUrl = config.keyserviceUrl;
		this.keyserviceKey = config.keyserviceKey;

		this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.project}/databases/(default)`;

		this.requestQueue = new HttpQueue(this);
		this.keyserviceThread = new KeyserviceThread(this);
	}

	public canProcessQueue() {
		// * Can be expanded when more cases are needed
		return !this.tokenInvalid;
	}

	public doc(documentPath: string) {
		return new DocumentReference(this, documentPath);
	}

	public collection(collectionPath: string) {
		return new CollectionReference(this, collectionPath);
	}
}
