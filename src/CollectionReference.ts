import { Firestore } from "Firestore";
import * as References from "References";
import { cleanPath, pathJoin } from "util/path";

export class CollectionReference {
	public path: string;

	private firestore: Firestore;

	public constructor(firestore: Firestore, path: string) {
		this.firestore = firestore;
		this.path = cleanPath(path);
	}

	public doc(path: string) {
		return new References.DocumentReference(this.firestore, pathJoin(this.path, path));
	}
}
