import { FirestoreClient } from "./init";
import { DocumentReference } from "./DocumentReference";

export interface IEncodedValue {
	doubleValue?: number;
	integerValue?: string;
	arrayValue?: {
		values: Array<IEncodedValue>;
	};
	stringValue?: string;
	booleanValue?: boolean;
	mapValue?: {
		fields: Map<string, IEncodedValue>;
	};
}

export class DocumentSnapshot {
	private parsedData?: Map<string, unknown>;

	public ref: DocumentReference;

	public exists = false;
	public fields?: Map<string, IEncodedValue>;

	public constructor(ref: DocumentReference, fields?: Map<string, IEncodedValue>) {
		this.ref = ref;

		this.fields = fields;

		if (this.fields) {
			this.exists = true;
		}
	}

	public static decodeValue(value: IEncodedValue) {
		if (value.stringValue !== undefined) {
			return value.stringValue;
		} else if (value.integerValue !== undefined) {
			return tonumber(value.integerValue);
		} else if (value.doubleValue !== undefined) {
			return tonumber(value.integerValue);
		} else if (value.booleanValue !== undefined) {
			return value.booleanValue;
		} else if (value.arrayValue !== undefined) {
			const output: Array<unknown> = [];

			value.arrayValue.values.forEach((element, index) => {
				const decodeElement = DocumentSnapshot.decodeValue(element);

				output.insert(index, decodeElement);
			});

			return output;
		} else if (value.mapValue !== undefined) {
			return DocumentSnapshot.decodeFields(value.mapValue.fields);
		}
	}

	public static decodeFields(fields: Map<string, IEncodedValue>) {
		const output = new Map<string, unknown>();

		fields.forEach((value, key) => {
			const decodeValue = DocumentSnapshot.decodeValue(value);

			output.set(key, decodeValue);
		});

		return output;
	}

	public data() {
		if (!this.exists || this.fields === undefined) {
			return undefined;
		}

		if (this.parsedData) {
			return this.parsedData;
		}

		this.parsedData = DocumentSnapshot.decodeFields(this.fields);

		return this.parsedData;
	}
}
