import { DocumentReference } from "DocumentReference";
import { decodeDocumentFields, RawFirestoreDocument } from "util/documentFields";

/**
 * Represents the data in a Document
 */
export class DocumentSnapshot {
	/**
	 * Not a type check, determines if a document was found at the given path
	 */
	public exists: boolean;

	/**
	 * Path to the document
	 */
	public path: string;

	/**
	 * [[DocumentReference]] that points to the source of the [[DocumentSnapshot]]
	 */
	public ref: DocumentReference;

	/**
	 * [[RawFirestoreDocument]] from Firestore REST API
	 */
	public rawDocument?: RawFirestoreDocument;

	public constructor(ref: DocumentReference, rawDocument?: RawFirestoreDocument) {
		this.ref = ref;
		this.path = ref.path;
		this.rawDocument = rawDocument;

		if (rawDocument) {
			this.exists = true;
		} else {
			this.exists = false;
		}
	}

	/**
	 * Decode raw data into a table
	 */
	public data() {
		if (this.rawDocument) {
			return decodeDocumentFields(this.rawDocument.fields);
		}
	}
}
