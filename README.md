# Nextjs Prisma Stripe Sync Engine

Continuously synchronizes a Stripe account to a Prisma-compatible database.

## Motivation

Sometimes you want to analyze your billing data using SQL. Even more importantly, you want to join your billing data to your product/business data.

This server synchronizes your Stripe account to a Prisma-compatible database. It can be a new database, or an existing database.

## How it works

![How it works](./docs/sync-engine-how.png)

- Creates a new schema `stripe` in a Postgres database, with tables & columns matching Stripe.
- Exposes a `/webhooks` endpoint that listens to any Stripe webhooks.
- Inserts/updates/deletes changes into the tables whenever there is a change to Stripe.

**Not implemented**

- This will not do an initial load of existing Stripe data. You should use CSV loads for this.

## Supported Webhooks

- [ ] `balance.available`
- [x] `charge.captured` 🟢
- [x] `charge.expired` 🟢
- [x] `charge.failed` 🟢
- [x] `charge.pending` 🟢
- [x] `charge.refunded` 🟢
- [x] `charge.succeeded` 🟢
- [x] `charge.updated` 🟢
- [x] `charge.dispute.closed` 🟢
- [x] `charge.dispute.created` 🟢
- [x] `charge.dispute.funds_reinstated` 🟢
- [x] `charge.dispute.funds_withdrawn` 🟢
- [x] `charge.dispute.updated` 🟢
- [ ] `checkout.session.async_payment_failed`
- [ ] `checkout.session.async_payment_succeeded`
- [ ] `checkout.session.completed`
- [x] `customer.created` 🟢
- [ ] `customer.deleted`
- [ ] `customer.source.created`
- [ ] `customer.source.updated`
- [x] `customer.subscription.created` 🟢
- [x] `customer.subscription.deleted` 🟢
- [x] `customer.subscription.paused` 🟢
- [x] `customer.subscription.pending_update_applied` 🟢
- [x] `customer.subscription.pending_update_expired` 🟢
- [x] `customer.subscription.resumed` 🟢
- [x] `customer.subscription.updated` 🟢
- [x] `customer.updated` 🟢
- [x] `invoice.created` 🟢
- [x] `invoice.finalized` 🟢
- [x] `invoice.paid` 🟢
- [x] `invoice.payment_failed` 🟢
- [x] `invoice.payment_succeeded` 🟢
- [x] `invoice.updated` 🟢
- [ ] `issuing_authorization.request`
- [ ] `issuing_card.created`
- [ ] `issuing_cardholder.created`
- [x] `payment_intent.amount_capturable_updated` 🟢
- [x] `payment_intent.canceled` 🟢
- [x] `payment_intent.created` 🟢
- [x] `payment_intent.partially_refunded` 🟢
- [x] `payment_intent.payment_failed` 🟢
- [x] `payment_intent.processing` 🟢
- [x] `payment_intent.requires_action` 🟢
- [x] `payment_intent.succeeded` 🟢
- [x] `payment_method.attached` 🟢
- [x] `payment_method.automatically_updated` 🟢
- [x] `payment_method.detached` 🟢
- [x] `payment_method.updated` 🟢
- [x] `plan.created` 🟢
- [x] `plan.deleted` 🟢
- [x] `plan.updated` 🟢
- [x] `price.created` 🟢
- [x] `price.deleted` 🟢
- [x] `price.updated` 🟢
- [x] `product.created` 🟢
- [x] `product.deleted` 🟢
- [x] `product.updated` 🟢
- [x] `setup_intent.canceled` 🟢
- [x] `setup_intent.created` 🟢
- [x] `setup_intent.requires_action` 🟢
- [x] `setup_intent.setup_failed` 🟢
- [x] `setup_intent.succeeded` 🟢
- [ ] `subscription_schedule.canceled`
- [ ] `subscription_schedule.created`
- [ ] `subscription_schedule.released`
- [ ] `subscription_schedule.updated`

## Usage

- Update your Stripe account with all valid webhooks and get the webhook secret
- `mv .env.sample .env` and then rename all the variables
- Make sure the database URL has search_path `stripe`. eg: `DATABASE_URL=postgres://postgres:postgres@hostname:5432/postgres?sslmode=disable&search_path=stripe`
- Deploy the docker image to your favourite hosting service and expose port `8080`
- Point your Stripe webooks to your deployed app.

## Backfill from Stripe

```
POST /sync
body: {
  "object": "product",
  "created": {
    "gte": 1643872333
  }
}
```

- `object` **all** | **charge** | **customer** | **dispute** | **invoice** | **payment_method** |  **payment_intent** | **plan** | **price** | **product** | **setup_intent** | **subscription**
- `created` is Stripe.RangeQueryParam. It supports **gt**, **gte**, **lt**, **lte**

#### Alternative routes to sync `daily/weekly/monthly` data

```
POST /sync/daily

---

POST /sync/daily
body: {
  "object": "product"
}
```

### Syncing single entity

To backfill/update a single entity, you can use

```
POST /sync/single/cus_12345
```

The entity type is recognized automatically, based on the prefix.

## Development

**Set up**

- Create a database.
- Update Stripe with all valid webhooks and get the webhook secret
- `mv .env.sample .env` and then rename all the variables

**Develop**

- `cd docker; docker-compose up` to start local database
- `npm run dev` to start the local server
- `npm run test` to run tests

**Building Docker**

```bash
docker build -t stripe-sync-engine .
docker run -p 8080:8080 stripe-sync-engine
```

