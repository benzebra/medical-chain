const Cleaning = artifacts.require("Cleaning");

contract("Cleaning", (accounts) => {
    let cleaning;
    let expectedObjectId;

    before(async () => {
        cleaning = await Cleaning.deployed();
    });

    describe("cleaning an object and retrieving account addresses", async () => {
        before("clean an object using accounts[0]", async () => {
            await cleaning.cleanObject(2, { from: accounts[0] });
                expectedObjectId = accounts[0];
            });

            it("can fetch the address of an owner by object id", async () => {
                const object = await cleaning.objects(2);
                console.log(object);
                assert.equal(object, expectedObjectId, "The owner of the cleaned object should be the first account.");
            });

            it("can fetch the collection of all object owners' addresses", async () => {
                const objects = await cleaning.getCleaners();
                console.log(objects)
                assert.equal(objects[8], expectedObjectId, "The owner of the cleaned object should be in the collection.");
            });
        });
});
