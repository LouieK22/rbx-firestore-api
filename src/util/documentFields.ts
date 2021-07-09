import { Geopoint } from "util/Geopoint";
import isArray from "util/isArray";

/**
 * Firestore-encoded string
 */
interface RawDocFieldString {
	stringValue: string;
}

/**
 * Firestore-encoded integer
 */
interface RawDocFieldInteger {
	integerValue: string;
}

/**
 * Firestore-encoded double
 */
interface RawDocFieldDouble {
	doubleValue: number;
}

/**
 * Firestore-encoded boolean
 */
interface RawDocFieldBoolean {
	booleanValue: boolean;
}

/**
 * Firestore-encoded geopoint
 */
interface RawDocFieldGeopoint {
	geoPointValue: {
		latitude: number;
		longitude: number;
	};
}

/**
 * Firestore array value
 */
type RawFirestoreDocumentArrayValue =
	| RawDocFieldString
	| RawDocFieldInteger
	| RawDocFieldDouble
	| RawDocFieldBoolean
	| RawDocFieldMap
	| RawDocFieldGeopoint;

/**
 * Firestore-encoded array
 */
interface RawDocFieldArray {
	arrayValue: {
		values: RawFirestoreDocumentArrayValue[];
	};
}

/**
 * Fields within a Firestore-encoded map
 */
export type MapFields = Map<string, RawFirestoreDocumentField>;

/**
 * Firestore-encoded map
 */
interface RawDocFieldMap {
	mapValue: {
		fields: MapFields;
	};
}

/**
 * Values for fields within a Firestore-encoded document
 */
export type RawFirestoreDocumentField = RawFirestoreDocumentArrayValue | RawDocFieldArray;

/**
 * Complete Firestore-encoded document
 */
export interface RawFirestoreDocument {
	name: string;
	createTime: string;
	updateTime: string;
	fields: MapFields;
}

/**
 * Value within a document array
 */
export type DocumentArrayValue = string | number | boolean | Geopoint | DocumentData;

/**
 * Values for fields within a document
 */
export type DocumentDataValue = DocumentArrayValue | Array<DocumentArrayValue>;

/**
 * Decoded document form
 */
export interface DocumentData {
	[field: string]: DocumentDataValue;
}

/**
 * Determines whether or not a value is an integer for encoding purposes
 * @param n Number to test
 */
function isInteger(n: number) {
	return n === math.floor(n);
}

/**
 * Encodes a a document array for Firestore
 * @param values Document array to encode
 */
function encodeArray(values: DocumentArrayValue[]): RawFirestoreDocumentArrayValue[] {
	const encoded = new Array<RawFirestoreDocumentArrayValue>();

	for (let i = 0; i < values.size(); i++) {
		const element = values[i];

		encoded.push(encodeDocumentFieldValue(element) as RawFirestoreDocumentArrayValue);
	}

	return encoded;
}

/**
 * Decodes a Firestore-encoded array into document format
 * @param values Firestore-encoded array to decode
 */
function decodeArray(values: RawFirestoreDocumentArrayValue[]): Array<DocumentArrayValue> {
	const parsed = new Array<DocumentArrayValue>();

	for (let i = 0; i < values.size(); i++) {
		const element = values[i];

		parsed.push(decodeDocumentFieldValue(element) as DocumentArrayValue);
	}

	return parsed;
}

/**
 * Decodes a single Firestore-encoded field value
 * @param value Single Firestore-encoded field
 */
export function decodeDocumentFieldValue(value: RawFirestoreDocumentField): DocumentDataValue {
	if ("stringValue" in value) {
		return value.stringValue;
	} else if ("integerValue" in value) {
		return tonumber(value.integerValue) as number;
	} else if ("doubleValue" in value) {
		return value.doubleValue;
	} else if ("booleanValue" in value) {
		return value.booleanValue;
	} else if ("arrayValue" in value) {
		return decodeArray(value.arrayValue.values);
	} else if ("geoPointValue" in value) {
		return new Geopoint(value.geoPointValue.latitude, value.geoPointValue.longitude);
	} else {
		return decodeDocumentFields(value.mapValue.fields);
	}
}

/**
 * Decodes a Firestore-encoded map into a document map
 * @param fields Map fields to decode
 */
export function decodeDocumentFields(fields: MapFields): DocumentData {
	const parsed: DocumentData = {};

	fields.forEach((value, key) => {
		parsed[key] = decodeDocumentFieldValue(value);
	});

	return parsed;
}

/**
 * Encodes a single Document field value into
 * @param value Document value to encode
 */
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
	} else if (isArray(value)) {
		return {
			arrayValue: {
				values: encodeArray(value),
			},
		};
	} else if (value instanceof Geopoint) {
		return {
			geoPointValue: {
				latitude: value.latitude,
				longitude: value.longitude,
			},
		};
	} else {
		return {
			mapValue: {
				fields: encodeDocumentFields(value),
			},
		};
	}
}

/**
 * Encodes a complete document into Firestore
 * @param fields Document map to encode
 */
export function encodeDocumentFields(fields: DocumentData) {
	const encoded: MapFields = new Map();

	const fieldsAsMap = fields as unknown as Map<string, DocumentData>;

	fieldsAsMap.forEach((value, key) => {
		encoded.set(key, encodeDocumentFieldValue(value));
	});

	return encoded;
}
