import { Firestore } from "Firestore";
import { DocumentReference } from "DocumentReference";
import { pathJoin, cleanPath } from "util/path";

export class CollectionReference {
	public path: string;

	private firestore: Firestore;

	public constructor(firestore: Firestore, path: string) {
		this.firestore = firestore;
		this.path = cleanPath(path);
	}

	public doc(path: string) {
		return new DocumentReference(this.firestore, pathJoin(this.path, path));
	}
}
