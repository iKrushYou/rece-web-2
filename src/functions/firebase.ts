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

export type UseGetReceiptResponse = {
  receipt: ReceiptEntity;
  items: Array<ItemEntity>;
  people: Array<PersonEntity>;
  isLoading: boolean;
  subTotal: number;
  total: number;
  setPersonItemQuantity: (personId: string, itemId: string, quantity: number) => Promise<void>;
  personSubTotalMap: Record<string, number>;
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

  const personSubTotalMap = useMemo<Record<string, number>>(() => {
    const personSubTotalMap: Record<string, number> = {};
    for (const person of people) {
      personSubTotalMap[person.id] = Object.entries(receipt.personToItemQuantityMap?.[person.id] ?? {}).reduce(
        (sum, [itemId, { quantity }]) => {
          const item = receipt.items?.[itemId];
          const numShares = Object.values(receipt.itemToPersonQuantityMap?.[itemId] ?? {}).reduce((sum, { quantity }) => sum + quantity, 0);
          if (!item) return sum;
          const proportionalCost = quantity > 0 && numShares > 0 ? (quantity / numShares) * item.cost : 0;
          return sum + proportionalCost;
        },
        0,
      );
    }
    return personSubTotalMap;
  }, [receipt]);

  const total = useMemo(() => subTotal + (receipt?.tipCost ?? 0) + (receipt?.taxCost ?? 0), [subTotal, receipt]);

  const getChargeForPerson = (charge: ChargeType, personId: string) =>
    currency(personSubTotalMap[personId])
      .divide(subTotal > 0 ? subTotal : 1)
      .multiply(receipt?.[charge] ?? 0).value;

  const getTotalForPerson = (personId: string) =>
    currency(personSubTotalMap[personId]).add(getChargeForPerson('taxCost', personId)).add(getChargeForPerson('tipCost', personId)).value;

  return {
    isLoading,
    receipt,
    items,
    subTotal,
    total,
    people,
    setPersonItemQuantity,
    personSubTotalMap,
    getChargeForPerson,
    getTotalForPerson,
  };
};

export const pushReceipt = (receipt: Partial<ReceiptEntity>): ThenableReference => {
  if (!receipt.date) receipt.date = new Date().getTime();
  if (!receipt.total) receipt.total = 0;
  if (!receipt.taxCost) receipt.taxCost = 0;
  if (!receipt.tipCost) receipt.tipCost = 0;
  if (!receipt.items) receipt.items = {};
  if (!receipt.people) receipt.people = {};
  if (!receipt.personToItemQuantityMap) receipt.personToItemQuantityMap = {};
  if (!receipt.itemToPersonQuantityMap) receipt.itemToPersonQuantityMap = {};

  return receiptsRef.push(receipt);
};

export const updateChargeValue = (receiptId: string, charge: ChargeType, valueString: string): Promise<void> =>
  receiptsRef.child(receiptId).child(charge).set(currency(valueString).value);

export const updateChargeValueByPct = (receiptId: string, charge: ChargeType, percentString: string, subTotal: number): Promise<void> => {
  const value = currency(subTotal).multiply(parseFloat(percentString)).divide(100.0).value;
  return receiptsRef.child(receiptId).child(charge).set(currency(value).value);
};

export const updateReceiptValue = (
  receiptId: string,
  key: ChargeType | 'title' | 'total' | 'date',
  value: string | number,
): Promise<void> => {
  return receiptsRef.child(receiptId).child(key).set(value);
};

export const updateReceiptItemValue = (
  receiptId: string,
  itemId: string,
  key: 'name' | 'cost' | 'quantity',
  value: string | number,
): Promise<void> => {
  return receiptsRef.child(receiptId).child('items').child(itemId).child(key).set(value);
};

export const getPersonCountForItem = (receipt: ReceiptEntity, itemId: string): number => {
  if (!receipt || !itemId) return 0;
  return Object.values(receipt.itemToPersonQuantityMap?.[itemId] ?? {}).reduce((sum, { quantity }) => sum + quantity, 0);
};

export const getItemQuantityForPerson = (receipt: ReceiptEntity, personId: string, itemId: string): number => {
  if (!receipt || !personId || !itemId) return 0;
  return ((receipt.personToItemQuantityMap ?? {})[personId] ?? {})[itemId]?.quantity ?? 0;
};
