/// <reference types="@rbxts/testez/globals" />

import { decodeDocumentFieldValue, DocumentArrayValue, MapFields } from "util/documentFields";
import { Geopoint } from "util/Geopoint";

export = () => {
	describe("decode document fields", () => {
		it("should decode stringValues", () => {
			const decoded = decodeDocumentFieldValue({
				stringValue: "hello world",
			});

			expect(decoded).to.equal("hello world");
		});

		it("should decode integerValues", () => {
			const decoded = decodeDocumentFieldValue({
				integerValue: "123",
			});

			expect(decoded).to.equal(123);
		});

		it("should decode doubleValues", () => {
			const decoded = decodeDocumentFieldValue({
				doubleValue: 12.34,
			});

			expect(decoded).to.equal(12.34);
		});

		it("should decode booleanValues", () => {
			const decoded = decodeDocumentFieldValue({
				booleanValue: true,
			});

			expect(decoded).to.equal(true);
		});

		it("should decode arrayValues", () => {
			const decoded = decodeDocumentFieldValue({
				arrayValue: {
					values: [{ stringValue: "hello" }, { integerValue: "321" }],
				},
			}) as Array<DocumentArrayValue>;

			expect(decoded[0]).to.equal("hello");
			expect(decoded[1]).to.equal(321);
		});

		it("should decode geoPointValues", () => {
			const decoded = decodeDocumentFieldValue({
				geoPointValue: {
					latitude: 60,
					longitude: -30,
				},
			}) as Geopoint;

			expect(decoded.latitude).to.equal(60);
			expect(decoded.longitude).to.equal(-30);
		});

		it("should decode mapValues", () => {
			const fakeMap: MapFields = new Map();
			fakeMap.set("thingy", { stringValue: "stuff" });
			fakeMap.set("other", { integerValue: "99" });

			const decoded = (decodeDocumentFieldValue({
				mapValue: {
					fields: fakeMap,
				},
			}) as unknown) as Map<string, unknown>;

			expect(decoded.get("thingy")).to.equal("stuff");
			expect(decoded.get("other")).to.equal(99);
		});
	});
};
