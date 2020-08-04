interface RawDocFieldString {
	stringValue: string;
}

interface RawDocFieldInteger {
	integerValue: string;
}

interface RawDocFieldDouble {
	doubleValue: number;
}

interface RawDocFieldBoolean {
	booleanValue: boolean;
}

export type MapFields = Map<string, RawFirestoreDocumentField>;
interface RawDocFieldMap {
	mapValue: {
		fields: MapFields;
	};
}

export type RawFirestoreDocumentField =
	| RawDocFieldString
	| RawDocFieldInteger
	| RawDocFieldDouble
	| RawDocFieldBoolean
	| RawDocFieldMap;

export interface RawFirestoreDocument {
	name: string;
	createTime: string;
	updateTime: string;
	fields: MapFields;
}

export type DocumentDataValue = string | number | boolean | DocumentData;

export interface DocumentData {
	[field: string]: DocumentDataValue;
}

function isInteger(n: number) {
	return n === math.floor(n);
}

export function decodeDocumentFieldValue(value: RawFirestoreDocumentField) {
	if ("stringValue" in value) {
		return value.stringValue;
	} else if ("integerValue" in value) {
		return tonumber(value.integerValue) as number;
	} else if ("doubleValue" in value) {
		return value.doubleValue;
	} else if ("booleanValue" in value) {
		return value.booleanValue;
	} else {
		return decodeDocumentFields(value.mapValue.fields);
	}
}

export function decodeDocumentFields(fields: MapFields): DocumentData {
	const parsed: DocumentData = {};

	fields.forEach((value, key) => {
		parsed[key] = decodeDocumentFieldValue(value);
	});

	return parsed;
}

export function encodeDocumentFieldValue(value: DocumentDataValue): RawFirestoreDocumentField {
	if (typeIs(value, "number")) {
		if (isInteger(value)) {
			return {
				integerValue: tostring(value),
			};
		} else {
			return {
				doubleValue: value,
			};
		}
	} else if (typeIs(value, "string")) {
		return {
			stringValue: value,
		};
	} else if (typeIs(value, "boolean")) {
		return {
			booleanValue: value,
		};
	} else {
		return {
			mapValue: {
				fields: encodeDocumentFields(value),
			},
		};
	}
}

export function encodeDocumentFields(fields: DocumentData) {
	const encoded: MapFields = new Map();

	const fieldsAsMap = (fields as unknown) as Map<string, DocumentData>;

	fieldsAsMap.forEach((value, key) => {
		encoded.set(key, encodeDocumentFieldValue(value));
	});

	return encoded;
}
