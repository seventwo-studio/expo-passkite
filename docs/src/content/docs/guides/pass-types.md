---
title: Pass Types
description: Understand the different types of Apple Wallet passes
---

Apple Wallet supports five distinct pass types, each with its own layout and intended use case. PassKite supports all of them.

## Store Card

**Best for:** Loyalty cards, membership cards, gift cards

```typescript
import { PassType } from 'expo-passkite';

builder.setPassType(PassType.StoreCard);
```

### Layout

- Logo and logo text in the header
- Primary fields prominently displayed (e.g., balance, points)
- Secondary and auxiliary fields below
- Strip image behind the primary field area

### Example Use Cases

- Coffee shop loyalty cards
- Retail store membership
- Gift cards with balance
- Gym memberships

### Recommended Fields

```typescript
builder
  .addPrimaryField({
    key: 'balance',
    label: 'BALANCE',
    value: '$50.00',
  })
  .addSecondaryField({
    key: 'name',
    label: 'MEMBER',
    value: 'John Doe',
  })
  .addAuxiliaryField({
    key: 'level',
    label: 'STATUS',
    value: 'Gold',
  });
```

## Event Ticket

**Best for:** Concerts, movies, sports events, conferences

```typescript
builder.setPassType(PassType.EventTicket);
```

### Layout

- Thumbnail or strip image
- Event name in primary field
- Date, time, venue in secondary fields
- Seat information in auxiliary fields

### Example Use Cases

- Concert tickets
- Movie tickets
- Sports event tickets
- Conference badges

### Recommended Fields

```typescript
builder
  .addPrimaryField({
    key: 'event',
    label: 'EVENT',
    value: 'Rock Concert 2024',
  })
  .addSecondaryField({
    key: 'date',
    label: 'DATE',
    value: 'Dec 25, 2024',
    dateStyle: 'PKDateStyleMedium',
  })
  .addSecondaryField({
    key: 'venue',
    label: 'VENUE',
    value: 'Madison Square Garden',
  })
  .addAuxiliaryField({
    key: 'seat',
    label: 'SEAT',
    value: 'Section A, Row 5, Seat 12',
  });
```

## Boarding Pass

**Best for:** Airlines, trains, buses, ferries

```typescript
builder.setPassType(PassType.BoardingPass);
```

### Layout

- Transit-specific layout with origin/destination
- Header fields for gate, boarding time
- Transit type indicator (air, train, bus, boat, generic)

### Transit Types

```typescript
import { TransitType } from 'expo-passkite';

builder.setTransitType(TransitType.Air);

// Available transit types:
// TransitType.Air
// TransitType.Boat
// TransitType.Bus
// TransitType.Train
// TransitType.Generic
```

### Recommended Fields

```typescript
builder
  .setTransitType(TransitType.Air)
  .addHeaderField({
    key: 'gate',
    label: 'GATE',
    value: 'A12',
  })
  .addPrimaryField({
    key: 'origin',
    label: 'SAN FRANCISCO',
    value: 'SFO',
  })
  .addPrimaryField({
    key: 'destination',
    label: 'NEW YORK',
    value: 'JFK',
  })
  .addSecondaryField({
    key: 'passenger',
    label: 'PASSENGER',
    value: 'JOHN DOE',
  })
  .addAuxiliaryField({
    key: 'boardingTime',
    label: 'BOARDING',
    value: '10:30 AM',
  })
  .addAuxiliaryField({
    key: 'seat',
    label: 'SEAT',
    value: '23A',
  });
```

## Coupon

**Best for:** Discounts, promotions, special offers

```typescript
builder.setPassType(PassType.Coupon);
```

### Layout

- Strip image area for promotional graphics
- Offer details in primary field
- Terms and conditions in back fields

### Example Use Cases

- Percentage discounts
- Buy-one-get-one offers
- Limited-time promotions
- Referral rewards

### Recommended Fields

```typescript
builder
  .addPrimaryField({
    key: 'offer',
    label: 'OFFER',
    value: '20% OFF',
  })
  .addSecondaryField({
    key: 'description',
    label: '',
    value: 'Your entire purchase',
  })
  .addAuxiliaryField({
    key: 'expires',
    label: 'EXPIRES',
    value: 'Dec 31, 2024',
  })
  .addBackField({
    key: 'terms',
    label: 'Terms & Conditions',
    value: 'Cannot be combined with other offers. Minimum purchase $50.',
  })
  .setExpirationDate(new Date('2024-12-31'));
```

## Generic

**Best for:** Any other type of pass

```typescript
builder.setPassType(PassType.Generic);
```

### Layout

- Flexible layout suitable for various use cases
- Thumbnail image support
- Standard field placement

### Example Use Cases

- ID badges
- Parking permits
- Library cards
- Insurance cards
- Any pass that doesn't fit other categories

### Recommended Fields

```typescript
builder
  .addPrimaryField({
    key: 'id',
    label: 'ID NUMBER',
    value: 'EMP-12345',
  })
  .addSecondaryField({
    key: 'name',
    label: 'NAME',
    value: 'John Doe',
  })
  .addAuxiliaryField({
    key: 'department',
    label: 'DEPARTMENT',
    value: 'Engineering',
  })
  .addAuxiliaryField({
    key: 'valid',
    label: 'VALID THROUGH',
    value: '2025',
  });
```

## Pass Type Comparison

| Feature | Store Card | Event Ticket | Boarding Pass | Coupon | Generic |
|---------|------------|--------------|---------------|--------|---------|
| Strip Image | ✓ | ✓ | ✗ | ✓ | ✗ |
| Thumbnail | ✗ | ✓ | ✗ | ✗ | ✓ |
| Background | ✗ | ✓ | ✗ | ✗ | ✗ |
| Transit Type | ✗ | ✗ | ✓ | ✗ | ✗ |
| Primary Fields | 1 | 1 | 2 | 1 | 1 |
| Header Fields | ✓ | ✓ | ✓ | ✓ | ✓ |

## Choosing the Right Type

1. **Store Card**: When users will use the pass repeatedly for purchases or check-ins
2. **Event Ticket**: For one-time or time-limited events
3. **Boarding Pass**: For transportation with origin/destination
4. **Coupon**: For promotional offers with expiration
5. **Generic**: When none of the above fit your use case

## Next Steps

- Learn to [Create Passes](/passkite/guides/creating-passes/) with the builder API
- Add passes with [Wallet Integration](/passkite/guides/wallet-integration/)
