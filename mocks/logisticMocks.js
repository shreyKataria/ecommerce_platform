const nock = require("nock");

const mockLogistics = () => {
  nock("https://api.logisticsprovider.com").post("/v1/shipments").reply(200, {
    id: "shipment_123",
    status: "created",
    tracking_number: "1Z9999999999999999",
  });
};

module.exports = mockLogistics;
