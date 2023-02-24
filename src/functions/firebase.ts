import firebase from 'firebase';
import { useEffect, useMemo, useState } from 'react';
import currency from 'currency.js';

type ThenableReference = firebase.database.ThenableReference;

const config = {
  apiKey: 'AIzaSyA0c1akMZuNjqCKy8XPOJMkt2gCxhbRTDo',
  authDomain: 'rece-a5835.firebaseapp.com',
  projectId: 'rece-a5835',
  storageBucket: 'rece-a5835.appspot.com',
  messagingSenderId: '952022605285',
  appId: '1:952022605285:web:dc6c4ad42eaeb6bf1ae30c',
  measurementId: 'G-6Z1RJYKRSE',
};

firebase.initializeApp(config);
export const auth = firebase.auth;
export const databaseRef = firebase.database().ref();
export const receiptsRef = databaseRef.child('receipts');

export type ReceiptEntity = {
  id: string;
  title: string;
  total: number;
  date: number;
  items?: Record<string, ItemEntity>;
  people?: Record<string, PersonEntity>;
  personToItemQuantityMap?: Record<string, Record<string, { quantity: number }>>;
  itemToPersonQuantityMap?: Record<string, Record<string, { quantity: number }>>;
  taxCost: number;
  tipCost: number;
  locked?: boolean;
  fees?: { name: string; amount: number }[];
};

export type ItemEntity = {
  id: string;
  name: string;
  cost: number;
  quantity: number;
};

export type PersonEntity = {
  id: string;
  name: string;
  paid: boolean;
};

export const useGetReceipts = (): {
  receipts: Array<ReceiptEntity>;
  isLoading: boolean;
} => {
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<Array<ReceiptEntity>>([]);

  useEffect(() => {
    receiptsRef.on('value', (snapshot) => {
      const items = snapshot.val();
      const newState = [];
      for (const item in items) {
        newState.push({
          id: item,
          ...items[item],
        });
      }
      setReceipts(newState);
      setIsLoading(false);
    });
  }, []);

  return { receipts, isLoading };
};

export type ChargeType = 'taxCost' | 'tipCost';

type PersonSubTotalMap = Record<
  string,
  { subTotal: number; items: Record<string, { subTotal: number; shares: number; totalShares: number }> }
>;

export type UseGetReceiptResponse = {
  receipt: ReceiptEntity;
  items: Array<ItemEntity>;
  people: Array<PersonEntity>;
  isLoading: boolean;
  subTotal: number;
  total: number;
  setPersonItemQuantity: (personId: string, itemId: string, quantity: number) => Promise<void>;
  personSubTotalMap: PersonSubTotalMap;
  getItemCostForPerson: (personId: string, itemId: string) => PersonSubTotalMap[string]['items'][string];
  getChargeForPerson: (charge: ChargeType, personId: string) => number;
  getTotalForPerson: (personId: string) => number;
};

export const useGetReceipt = (id: string): UseGetReceiptResponse => {
  const [isLoading, setIsLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptEntity>({
    date: 0,
    id: '',
    itemToPersonQuantityMap: {},
    items: {},
    people: {},
    personToItemQuantityMap: {},
    taxCost: 0,
    tipCost: 0,
    title: '',
    total: 0,
    locked: false,
  });

  useEffect(() => {
    receiptsRef.child(id).on('value', (snapshot) => {
      const receipt = snapshot.val();
      setReceipt({ ...receipt, id });
      setIsLoading(false);
    });
  }, []);

  const items = useMemo<Array<ItemEntity>>(() => {
    if (!receipt) return [];
    return Object.entries(receipt.items ?? {}).map(([id, item]) => ({
      ...item,
      id,
    }));
  }, [receipt]);

  const subTotal = useMemo(() => items.reduce((sum, item) => currency(sum).add(item.cost).value, 0), [items]);

  const people = useMemo<Array<PersonEntity>>(() => {
    if (!receipt) return [];
    return Object.entries(receipt.people ?? {}).map(([id, person]) => ({
      ...person,
      id,
    }));
  }, [receipt]);

  const setPersonItemQuantity = async (personId: string, itemId: string, quantity = 1) => {
    await receiptsRef
      .child(id)
      .child('personToItemQuantityMap')
      .child(personId)
      .child(itemId)
      .update({ quantity: Math.max(quantity, 0) });
    await receiptsRef
      .child(id)
      .child('itemToPersonQuantityMap')
      .child(itemId)
      .child(personId)
      .update({ quantity: Math.max(quantity, 0) });
  };

  const personSubTotalMap = useMemo(() => {
    const personSubTotalMap: PersonSubTotalMap = {};

    for (const person of people) {
      personSubTotalMap[person.id] = { subTotal: 0, items: {} };
      Object.entries(receipt.personToItemQuantityMap?.[person.id] ?? {}).forEach(([itemId, { quantity }]) => {
        const item = receipt.items?.[itemId];
        if (!item) return;
        const numShares = Object.values(receipt.itemToPersonQuantityMap?.[itemId] ?? {}).reduce((sum, { quantity }) => sum + quantity, 0);
        const proportionalCost = quantity > 0 && numShares > 0 ? (quantity / numShares) * item.cost : 0;

        personSubTotalMap[person.id].items[itemId] = {
          subTotal: proportionalCost,
          shares: quantity,
          totalShares: numShares,
        };

        personSubTotalMap[person.id].subTotal += proportionalCost;
      });
    }
    return personSubTotalMap;
  }, [receipt]);

  const total = useMemo(() => subTotal + (receipt?.tipCost ?? 0) + (receipt?.taxCost ?? 0), [subTotal, receipt]);

  useEffect(() => {
    if (receipt.total === total) return;
    receiptsRef.child(id).child('total').set(currency(total).value);
  }, [total]);

  const getChargeForPerson = (charge: ChargeType, personId: string) =>
    currency((personSubTotalMap[personId] ?? {}).subTotal)
      .divide(subTotal > 0 ? subTotal : 1)
      .multiply(receipt?.[charge] ?? 0).value;

  const getTotalForPerson = (personId: string) =>
    currency((personSubTotalMap[personId] ?? {}).subTotal)
      .add(getChargeForPerson('taxCost', personId))
      .add(getChargeForPerson('tipCost', personId)).value;

  const getItemCostForPerson = (personId: string, itemId: string) => {
    return personSubTotalMap[personId].items[itemId] ?? { subTotal: 0, totalShares: 0, shares: 0 };
  };

  return {
    isLoading,
    receipt,
    items,
    subTotal,
    total,
    people,
    setPersonItemQuantity,
    personSubTotalMap,
    getItemCostForPerson,
    getChargeForPerson,
    getTotalForPerson,
  };
};

export const pushReceipt = (receipt: Partial<ReceiptEntity>): ThenableReference => {
  if (!receipt.date) receipt.date = new Date().getTime();
  if (!receipt.total) receipt.total = 0;
  if (!receipt.locked) receipt.locked = false;
  if (!receipt.taxCost) receipt.taxCost = 0;
  if (!receipt.tipCost) receipt.tipCost = 0;
  if (!receipt.items) receipt.items = {};
  if (!receipt.people) receipt.people = {};
  if (!receipt.personToItemQuantityMap) receipt.personToItemQuantityMap = {};
  if (!receipt.itemToPersonQuantityMap) receipt.itemToPersonQuantityMap = {};

  return receiptsRef.push(receipt);
};

export const updateChargeValue = async (receiptId: string, charge: ChargeType, valueString: string) => {
  await receiptsRef.child(receiptId).child(charge).set(currency(valueString).value);
};

export const updateChargeValueByPct = async (receiptId: string, charge: ChargeType, percentString: string, subTotal: number) => {
  const value = currency(subTotal).multiply(parseFloat(percentString)).divide(100.0).value;
  await receiptsRef.child(receiptId).child(charge).set(currency(value).value);
};

export const updateReceiptProperty = async (
  receiptId: string,
  key: ChargeType | 'title' | 'date' | 'locked',
  value: string | number | boolean,
) => {
  await receiptsRef.child(receiptId).child(key).set(value);
};

export const updateReceiptItemValue = async (
  receiptId: string,
  itemId: string,
  key: 'name' | 'cost' | 'quantity',
  value: string | number,
) => {
  await receiptsRef.child(receiptId).child('items').child(itemId).child(key).set(value);
};

export const getPersonCountForItem = (receipt: ReceiptEntity, itemId: string): number => {
  if (!receipt || !itemId) return 0;
  return Object.values(receipt.itemToPersonQuantityMap?.[itemId] ?? {}).reduce((sum, { quantity }) => sum + quantity, 0);
};

export const getItemQuantityForPerson = (receipt: ReceiptEntity, personId: string, itemId: string): number => {
  if (!receipt || !personId || !itemId) return 0;
  return ((receipt.personToItemQuantityMap ?? {})[personId] ?? {})[itemId]?.quantity ?? 0;
};

export async function updateReceiptFee(receipt: ReceiptEntity, feeName: string, feeAmount: number) {
  const fees = receipt.fees ?? [];
  if (!fees.some((fee) => fee.name === feeName)) {
    fees.push({ name: feeName, amount: feeAmount });
  } else {
    for (const fee of fees) {
      if (fee.name !== feeName) continue;

      fee.amount = feeAmount;
      break;
    }
  }
  await receiptsRef.child(receipt.id).child('fees').set(fees);
}

export async function updatePerson(receipt: ReceiptEntity, person: PersonEntity) {
  if (!receipt || !person) return;
  await receiptsRef.child(receipt.id).child('people').child(person.id).set(person);
}
