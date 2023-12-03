
import request from "supertest";
import app from "../httpServer";

const expect = require("chai").expect;

describe("Test the basic  application", function () {
    describe("Test the authentication", function () {
        it("test login ", async () => {
            const response = (await request(app)
                .get("/api/authenticate")
                .set("Authorization", "Basic YWRtaW46MTIz")
            )
            expect(response.status).to.equal(200);
        });

    })
})