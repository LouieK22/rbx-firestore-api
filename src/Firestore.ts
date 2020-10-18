import { CollectionReference } from "CollectionReference";
import { DocumentReference } from "DocumentReference";
import { TokenManager } from "TokenManager";

/**
 * Configuration for a new Firestore client
 */
export interface FirestoreConfig {
	/**
	 * Name of GCP/Firebase project
	 */
	project: string;

	/**
	 * Configuration for build-in keyserver
	 * In the future, this will be expanded to support a more dynamic system
	 */
	keyServer: {
		/**
		 * URL for keyserver
		 */
		url: string;

		/**
		 * Private API key sent with requests to keyserver
		 */
		key: string;
	};
}

/**
 * Top level Firestore, represents an entire GCP/Firebase Project's Firestore
 * Manages the TokenManager instance for the project
 */
export class Firestore {
	public config: FirestoreConfig;
	public baseUrl: string;

	public tokenManager: TokenManager;

	public constructor(config: FirestoreConfig) {
		this.config = config;
		this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.config.project}/databases/(default)`;
		this.tokenManager = new TokenManager(this);
	}

	/**
	 * Returns a new [[CollectionReference]] for the provided path
	 *
	 * @param path Path to a collection
	 */
	public collection(path: string) {
		// TODO: Validate path
		return new CollectionReference(this, path);
	}

	/**
	 * Returns a new [[DocumentReference]] for the provided path
	 *
	 * @param path Path to a document
	 */
	public doc(path: string) {
		return new DocumentReference(this, path);
	}
}
