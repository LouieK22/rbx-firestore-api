import { DocumentReference } from "DocumentReference";
import { RawFirestoreDocument, decodeDocumentFields } from "util/documentFields";

export class DocumentSnapshot {
	public exists: boolean;
	public id: string;
	public ref: DocumentReference;

	public rawDocument?: RawFirestoreDocument;

	public constructor(ref: DocumentReference, rawDocument?: RawFirestoreDocument) {
		this.ref = ref;
		this.id = ref.id;
		this.rawDocument = rawDocument;

		if (rawDocument) {
			this.exists = true;
		} else {
			this.exists = false;
		}
	}

	public data() {
		if (this.rawDocument) {
			return decodeDocumentFields(this.rawDocument.fields);
		}
	}
}
