import { Firestore } from "Firestore";
import * as References from "References";
import { cleanPath, pathJoin } from "util/path";

/**
 * Provides a reference to a Firestore collection.
 */
export class CollectionReference {
	/**
	 * Collection path
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
	 * Gets a document reference for a given path within the collection
	 * @param path Document path
	 */
	public doc(path: string) {
		return new References.DocumentReference(this.firestore, pathJoin(this.path, path));
	}
}
