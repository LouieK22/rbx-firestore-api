local isArray = require(script.Parent.isArray)

return function()
	it("should detect arrays", function()
		local result = isArray({"a", "b", "c"})

		expect(result).to.equal(true)
	end)

	it("should detect tables", function()
		local result = isArray({
			a = 1,
			b = 2,
			c = 3
		})

		expect(result).never.to.equal(true)
	end)
end
