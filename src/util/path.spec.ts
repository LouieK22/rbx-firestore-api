/// <reference types="@rbxts/testez/globals" />

import { cleanPath, pathJoin } from "util/path";

export = () => {
	it("should clean paths", () => {
		const path = cleanPath("/foo/bar/");

		expect(path).to.equal("foo/bar");
	});

	it("should merge dirty paths", () => {
		const path = pathJoin("/foo/bar/", "/baz/");

		expect(path).to.equal("foo/bar/baz");
	});
};
