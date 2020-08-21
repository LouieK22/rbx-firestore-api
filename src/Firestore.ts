import { CollectionReference } from "CollectionReference";
import { DocumentReference } from "DocumentReference";
import { TokenManager } from "TokenManager";

export interface FirestoreConfig {
	project: string;
	keyServer: {
		url: string;
		key: string;
	};
}

export class Firestore {
	public config: FirestoreConfig;
	public baseUrl: string;

	public tokenManager: TokenManager;

	public constructor(config: FirestoreConfig) {
		this.config = config;
		this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.config.project}/databases/(default)`;
		this.tokenManager = new TokenManager(this);
	}

	public collection(path: string) {
		return new CollectionReference(this, path);
	}

	public doc(path: string) {
		return new DocumentReference(this, path);
	}
}
