const nock = require("nock");

const mockStripe = () => {
  nock("https://api.stripe.com")
    .post("/v1/charges")
    .reply(201, {
      id: "ch_1IqkYuEAXIGNKZN3U6vJCK1G",
      amount: 2000,
      currency: "usd",
      source: {
        id: "card_1IqkUYEAXIGNKZN3kj99G9Vu",
        brand: "Visa",
        last4: "4242",
        exp_month: 12,
        exp_year: 2021,
      },
    });
};

const mockPayPal = () => {
  nock("https://api-m.sandbox.paypal.com")
    .post("/v2/checkout/orders")
    .reply(201, {
      id: "5O190127TN364715T",
      status: "CREATED",
    });
};

module.exports = { mockStripe, mockPayPal };
